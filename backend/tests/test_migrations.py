from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text


def test_migrations_create_wishes_table(tmp_path: Path) -> None:
    database_path = tmp_path / "migrations.db"
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", f"sqlite:///{database_path}")

    command.upgrade(config, "head")

    engine = create_engine(f"sqlite:///{database_path}")
    inspector = inspect(engine)
    assert "wishes" in inspector.get_table_names()
    assert {column["name"] for column in inspector.get_columns("wishes")} == {
        "id",
        "text",
        "status",
        "visibility",
        "moderation_status",
        "created_at",
        "granted_at",
        "sky_x",
        "sky_y",
        "claim_token_hash",
    }
    text_column = next(
        column for column in inspector.get_columns("wishes") if column["name"] == "text"
    )
    assert text_column["type"].length == 200
    check_names = {
        constraint["name"] for constraint in inspector.get_check_constraints("wishes")
    }
    assert "moderation_status" in check_names
    engine.dispose()


def test_migration_auto_approves_only_pending_public_wishes(tmp_path: Path) -> None:
    database_path = tmp_path / "moderation-migration.db"
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", f"sqlite:///{database_path}")
    command.upgrade(config, "20261015_03")

    engine = create_engine(f"sqlite:///{database_path}")
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO wishes "
                "(id, text, status, visibility, moderation_status, created_at, "
                "granted_at, sky_x, sky_y, claim_token_hash) VALUES "
                "(:id, :text, 'pending', :visibility, :moderation, "
                ":created_at, NULL, 50, 50, :token_hash)"
            ),
            [
                {
                    "id": "1" * 32,
                    "text": "public pending",
                    "visibility": "public",
                    "moderation": "pending",
                    "created_at": "2026-01-01T00:00:00+00:00",
                    "token_hash": "a" * 64,
                },
                {
                    "id": "2" * 32,
                    "text": "private pending",
                    "visibility": "private",
                    "moderation": "pending",
                    "created_at": "2026-01-01T00:00:00+00:00",
                    "token_hash": "b" * 64,
                },
                {
                    "id": "3" * 32,
                    "text": "public rejected",
                    "visibility": "public",
                    "moderation": "rejected",
                    "created_at": "2026-01-01T00:00:00+00:00",
                    "token_hash": "c" * 64,
                },
            ],
        )

    command.upgrade(config, "head")
    with engine.connect() as connection:
        statuses = dict(
            connection.execute(
                text("SELECT text, moderation_status FROM wishes")
            ).all()
        )
    engine.dispose()

    assert statuses == {
        "public pending": "approved",
        "private pending": "pending",
        "public rejected": "rejected",
    }
