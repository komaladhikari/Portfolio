import uuid
from collections.abc import Generator
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database import Base, get_db
from app.main import app
from app.models import Wish, WishStatus
from app.schemas import WishCreate
from app.services import create_wish as create_wish_record
from app.services import grant_wish as grant_wish_record


def create_wish(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/wishes",
        json={"text": "A wish ready to be granted", "visibility": "public"},
    )
    assert response.status_code == 201
    return response.json()


def grant(client: TestClient, created: dict[str, str]):
    return client.post(
        f"/api/wishes/{created['id']}/grant",
        headers={"X-Claim-Token": created["claim_token"]},
    )


def test_grant_pending_wish(
    api_client: TestClient,
    db_session: Session,
) -> None:
    created = create_wish(api_client)
    wish_id = uuid.UUID(created["id"])
    pending_wish = db_session.scalar(select(Wish).where(Wish.id == wish_id))
    assert pending_wish is not None
    original_coordinates = (pending_wish.sky_x, pending_wish.sky_y)

    response = grant(api_client, created)

    assert response.status_code == 200
    assert set(response.json()) == {"id", "status", "granted_at"}
    assert response.json()["id"] == created["id"]
    assert response.json()["status"] == "granted"
    assert response.json()["granted_at"] is not None

    db_session.expire_all()
    saved_wish = db_session.get(Wish, wish_id)
    assert saved_wish is not None
    assert saved_wish.status is WishStatus.GRANTED
    assert saved_wish.granted_at is not None
    assert (saved_wish.sky_x, saved_wish.sky_y) == original_coordinates


def test_grant_wish_is_idempotent(api_client: TestClient) -> None:
    created = create_wish(api_client)

    first_response = grant(api_client, created)
    second_response = grant(api_client, created)

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.json() == first_response.json()


def test_concurrent_grants_keep_one_timestamp(tmp_path) -> None:
    database_path = tmp_path / "concurrent-grant.db"
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={"check_same_thread": False, "timeout": 10},
    )
    Base.metadata.create_all(engine)

    with Session(engine) as setup_session:
        wish, claim_token = create_wish_record(
            setup_session,
            WishCreate(text="A concurrent wish", visibility="private"),
        )
        wish_id = wish.id

    update_barrier = Barrier(2)

    @event.listens_for(engine, "before_cursor_execute")
    def synchronize_updates(connection, cursor, statement, parameters, context, executemany):
        if statement.lstrip().upper().startswith("UPDATE WISHES"):
            update_barrier.wait(timeout=5)

    def grant_in_separate_session():
        with Session(engine) as session:
            granted = grant_wish_record(session, wish_id, claim_token)
            return granted.granted_at

    with ThreadPoolExecutor(max_workers=2) as executor:
        timestamps = list(executor.map(lambda _: grant_in_separate_session(), range(2)))

    event.remove(engine, "before_cursor_execute", synchronize_updates)
    engine.dispose()

    assert timestamps[0] is not None
    assert timestamps[0] == timestamps[1]


def test_grant_wish_rejects_invalid_token(api_client: TestClient) -> None:
    created = create_wish(api_client)

    response = api_client.post(
        f"/api/wishes/{created['id']}/grant",
        headers={"X-Claim-Token": "incorrect-token"},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Invalid claim token."}


def test_grant_wish_returns_404_for_unknown_wish(api_client: TestClient) -> None:
    response = api_client.post(
        f"/api/wishes/{uuid.uuid4()}/grant",
        headers={"X-Claim-Token": "any-token"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Wish not found."}


def test_granted_wish_persists_across_database_sessions(tmp_path) -> None:
    database_path = tmp_path / "persistent-grant.db"
    database_url = f"sqlite:///{database_path}"
    first_engine = create_engine(database_url)
    Base.metadata.create_all(first_engine)

    with Session(first_engine) as first_session:
        def first_override() -> Generator[Session, None, None]:
            yield first_session

        app.dependency_overrides[get_db] = first_override
        with TestClient(app) as client:
            created = create_wish(client)
            first_response = grant(client, created)

    app.dependency_overrides.clear()
    first_engine.dispose()

    second_engine = create_engine(database_url)
    with Session(second_engine) as second_session:
        def second_override() -> Generator[Session, None, None]:
            yield second_session

        app.dependency_overrides[get_db] = second_override
        try:
            with TestClient(app) as client:
                second_response = grant(client, created)
        finally:
            app.dependency_overrides.clear()

    second_engine.dispose()

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.json() == first_response.json()


def test_grant_wish_hides_database_error() -> None:
    class FailingSession:
        def scalar(self, statement):
            raise OperationalError("SELECT", {}, Exception("private database detail"))

        def rollback(self) -> None:
            pass

    def override_get_db():
        yield FailingSession()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as client:
            response = client.post(
                f"/api/wishes/{uuid.uuid4()}/grant",
                headers={"X-Claim-Token": "any-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json() == {"detail": "Wish could not be granted."}
    assert "private database detail" not in response.text
