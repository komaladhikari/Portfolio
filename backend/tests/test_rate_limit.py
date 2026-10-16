from fastapi.testclient import TestClient

from app.rate_limit import grant_limiter, submission_limiter


def create_wish(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/wishes",
        json={"text": "A rate-limited wish", "visibility": "private"},
    )
    assert response.status_code == 201
    return response.json()


def test_submission_rate_limit_returns_retry_after(
    api_client: TestClient,
    monkeypatch,
) -> None:
    monkeypatch.setattr(submission_limiter, "limit", 1)

    create_wish(api_client)
    response = api_client.post(
        "/api/wishes",
        json={"text": "One request too many", "visibility": "private"},
    )

    assert response.status_code == 429
    assert response.json() == {"detail": "Too many requests. Please try again later."}
    assert int(response.headers["retry-after"]) >= 1


def test_grant_rate_limit_is_separate(
    api_client: TestClient,
    monkeypatch,
) -> None:
    created = create_wish(api_client)
    monkeypatch.setattr(grant_limiter, "limit", 1)
    grant_url = f"/api/wishes/{created['id']}/grant"
    headers = {"X-Claim-Token": created["claim_token"]}

    assert api_client.post(grant_url, headers=headers).status_code == 200
    response = api_client.post(grant_url, headers=headers)

    assert response.status_code == 429
