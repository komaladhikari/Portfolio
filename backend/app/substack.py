from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
from threading import Lock
from urllib.request import Request, urlopen
from xml.etree import ElementTree


SUBSTACK_FEED_URL = "https://komalaadhikari33.substack.com/feed"
CACHE_DURATION = timedelta(minutes=15)


class SubstackFeedError(Exception):
    pass


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def _plain_text(value: str | None) -> str:
    parser = _TextExtractor()
    parser.feed(value or "")
    return " ".join(unescape("".join(parser.parts)).split())


def _parse_feed(payload: bytes) -> list[dict[str, str | datetime]]:
    try:
        root = ElementTree.fromstring(payload)
    except ElementTree.ParseError as error:
        raise SubstackFeedError("Substack returned an invalid feed.") from error

    posts: list[dict[str, str | datetime]] = []
    for item in root.findall("./channel/item"):
        title = _plain_text(item.findtext("title"))
        excerpt = _plain_text(item.findtext("description"))
        url = (item.findtext("link") or "").strip()
        published = (item.findtext("pubDate") or "").strip()
        if not title or not url or not published:
            continue
        try:
            published_at = parsedate_to_datetime(published)
        except (TypeError, ValueError):
            continue
        posts.append({"title": title, "excerpt": excerpt, "url": url, "published_at": published_at})
    return posts


_cache_lock = Lock()
_cached_posts: list[dict[str, str | datetime]] = []
_cache_expires_at = datetime.min.replace(tzinfo=timezone.utc)


def get_substack_posts() -> list[dict[str, str | datetime]]:
    global _cached_posts, _cache_expires_at

    now = datetime.now(timezone.utc)
    with _cache_lock:
        if _cached_posts and now < _cache_expires_at:
            return _cached_posts
        try:
            request = Request(SUBSTACK_FEED_URL, headers={"User-Agent": "Komala-Portfolio/1.0"})
            with urlopen(request, timeout=8) as response:
                posts = _parse_feed(response.read())
            if not posts:
                raise SubstackFeedError("The Substack feed did not contain any posts.")
        except SubstackFeedError:
            if _cached_posts:
                return _cached_posts
            raise
        except Exception as error:
            if _cached_posts:
                return _cached_posts
            raise SubstackFeedError("The Substack feed could not be reached.") from error

        _cached_posts = posts
        _cache_expires_at = now + CACHE_DURATION
        return _cached_posts
