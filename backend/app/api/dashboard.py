# app/api/dashboard.py
"""
Dashboard endpoint.

Accepts X-Session-Token header. If no valid session is found,
returns Demo Mode data (is_demo: true) — never a 401 error.
"""

import logging
from fastapi import APIRouter, Header
from typing import Optional

from app.services.dashboard_service import DashboardService
from app.sessions.session_store import session_store

logger = logging.getLogger("cloudops.api.dashboard")

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
service = DashboardService()


@router.get("/")
def dashboard(
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    # Resolve session (may be None → demo mode)
    sess = session_store.get(x_session_token) if x_session_token else None

    if sess:
        logger.info(
            "Dashboard request: account=%s region=%s",
            sess.account_id,
            sess.region,
        )
        return service.get_dashboard(
            boto3_session=sess.boto3_session,
            region=sess.region,
            is_demo=False,
        )
    else:
        logger.info("Dashboard request: demo mode (no valid session)")
        return service.get_dashboard(boto3_session=None, region=None, is_demo=True)