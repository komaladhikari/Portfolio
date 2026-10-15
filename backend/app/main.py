from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import get_settings
from app.routers.sky import router as sky_router
from app.routers.wishes import router as wishes_router

settings = get_settings()
app = FastAPI(title=settings.name, debug=settings.debug)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Claim-Token"],
)
app.include_router(sky_router)
app.include_router(wishes_router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
