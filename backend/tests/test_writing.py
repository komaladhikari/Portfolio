from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.main import app
from app.routers import writing
from app.substack import _parse_feed


def test_substack_feed_parser_uses_real_rss_fields() -> None:
    payload = b"""<?xml version="1.0"?>
    <rss><channel><item>
      <title>A real &amp; thoughtful title</title>
      <description><![CDATA[<p>A short <strong>published</strong> excerpt.</p>]]></description>
      <link>https://example.substack.com/p/a-real-title</link>
      <pubDate>Wed, 07 Oct 2026 00:04:30 GMT</pubDate>
    </item></channel></rss>"""

    post = _parse_feed(payload)[0]

    assert post["title"] == "A real & thoughtful title"
    assert post["excerpt"] == "A short published excerpt."
    assert post["published_at"] == datetime(2026, 10, 7, 0, 4, 30, tzinfo=timezone.utc)


def test_writing_feed_returns_latest_posts(monkeypatch) -> None:
    monkeypatch.setattr(
        writing,
        "get_substack_posts",
        lambda: [
            {
                "title": "A real title",
                "excerpt": "A real excerpt.",
                "url": "https://example.substack.com/p/a-real-title",
                "published_at": datetime(2026, 10, 7, tzinfo=timezone.utc),
            }
        ],
    )

    response = TestClient(app).get("/api/writing")

    assert response.status_code == 200
    assert response.json()["posts"][0]["title"] == "A real title"
    assert response.json()["posts"][0]["published_at"] == "2026-10-07T00:00:00Z"
