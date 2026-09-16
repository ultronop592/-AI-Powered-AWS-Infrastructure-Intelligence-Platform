"""
CloudOps AI — FastAPI Application Entry Point (v2.0)

Production features:
  - Structured logging to stdout
  - Session cleanup background task (removes expired sessions periodically)
  - CORS configured for local dev; tighten allow_origins for production
"""

import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.dashboard import router as dashboard_router
from app.api.copilot import router as copilot_router
from app.api.auth_aws import router as auth_aws_router
from app.api.graph import router as graph_router
from app.api.remediation import router as remediation_router
from app.sessions.session_store import session_store


# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("cloudops.main")


# ---------------------------------------------------------------------------
# Background: periodic session cleanup
# ---------------------------------------------------------------------------

async def _session_cleanup_loop():
    """Remove expired sessions every SESSION_CLEANUP_INTERVAL seconds."""
    while True:
        await asyncio.sleep(settings.SESSION_CLEANUP_INTERVAL)
        removed = session_store.cleanup_expired()
        if removed:
            logger.info("Background cleanup: removed %d expired session(s)", removed)


# ---------------------------------------------------------------------------
# App lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting %s v%s — Session TTL=%ds, Cache TTL=%ds",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.SESSION_TTL_SECONDS,
        settings.CACHE_TTL_SECONDS,
    )
    cleanup_task = asyncio.create_task(_session_cleanup_loop())
    yield
    cleanup_task.cancel()
    logger.info("%s shutting down.", settings.APP_NAME)


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Powered AWS Infrastructure Intelligence Platform. "
        "Secure session-based auth, structured Bedrock AI reports, "
        "parallel AWS data collection, and Cloud Health Scoring."
    ),
    lifespan=lifespan,
)

cors_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if cors_origins_env:
    allowed_origins.extend([origin.strip() for origin in cors_origins_env.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(copilot_router)
app.include_router(auth_aws_router)
app.include_router(graph_router)
app.include_router(remediation_router)


@app.get("/", tags=["Health"])
def health():
    return {
        "status": "running",
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "active_sessions": session_store.count(),
    }
@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok"}