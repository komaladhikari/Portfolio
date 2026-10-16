from dataclasses import dataclass
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request, status

from app.config import get_settings


@dataclass
class RequestWindow:
    started_at: float
    count: int


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._windows: dict[str, RequestWindow] = {}
        self._lock = Lock()

    def check(self, key: str, now: float | None = None) -> None:
        checked_at = monotonic() if now is None else now
        with self._lock:
            window = self._windows.get(key)
            if window is None or checked_at - window.started_at >= self.window_seconds:
                self._windows[key] = RequestWindow(started_at=checked_at, count=1)
                return
            if window.count >= self.limit:
                retry_after = max(1, ceil(self.window_seconds - (checked_at - window.started_at)))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )
            window.count += 1

    def reset(self) -> None:
        with self._lock:
            self._windows.clear()


settings = get_settings()
submission_limiter = RateLimiter(
    settings.wish_submit_rate_limit,
    settings.rate_limit_window_seconds,
)
grant_limiter = RateLimiter(
    settings.wish_grant_rate_limit,
    settings.rate_limit_window_seconds,
)


def _client_key(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def limit_wish_submission(request: Request) -> None:
    submission_limiter.check(_client_key(request))


def limit_wish_grant(request: Request) -> None:
    grant_limiter.check(_client_key(request))
