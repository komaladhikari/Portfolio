from fastapi import FastAPI

from app.config import get_settings
from app.routers.sky import router as sky_router
from app.routers.wishes import router as wishes_router

settings = get_settings()
app = FastAPI(title=settings.name, debug=settings.debug)
app.include_router(sky_router)
app.include_router(wishes_router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
