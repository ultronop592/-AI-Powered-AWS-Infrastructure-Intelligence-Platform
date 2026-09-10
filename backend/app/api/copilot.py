# app/api/copilot.py
"""
AI Copilot endpoint — powered by Groq (platform-owned API key).

The copilot uses our own Groq key so users never need to configure an AI
service. When a user is connected to their AWS account, their live
infrastructure data (costs, security posture, resource counts, etc.) is
injected as context so the LLM can answer account-specific questions too.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Header
from pydantic import BaseModel
from typing import Optional

from app.ai.groq_client import groq_copilot
from app.services.dashboard_service import DashboardService
from app.sessions.session_store import session_store

logger = logging.getLogger("cloudops.api.copilot")

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])
dashboard_service = DashboardService()


class CopilotChatRequest(BaseModel):
    message: str
    mode: Optional[str] = "chat"  # "chat" or "terraform"


@router.post("/chat")
def copilot_chat(
    req: CopilotChatRequest,
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    # Resolve user session (if connected to an AWS account)
    sess = session_store.get(x_session_token) if x_session_token else None
    boto3_session = sess.boto3_session if sess else None
    region = sess.region if sess else "us-east-1"

    # Build AWS context for the copilot — uses real live data when connected
    context: dict = {"region": region}
    if sess:
        try:
            dashboard_data = dashboard_service.get_dashboard(
                boto3_session=boto3_session,
                region=region,
                is_demo=False,
            )
            context = {
                "region": region,
                "summary": dashboard_data.get("summary"),
                "recommendations": dashboard_data.get("recommendations"),
                "security_summary": dashboard_data.get("security_summary"),
                "ai_report": dashboard_data.get("ai_report"),
            }
        except Exception as exc:
            logger.warning("Could not fetch dashboard context for copilot: %s", exc)

    # Call Groq copilot (platform-owned key — no user config needed)
    reply, engine_source = groq_copilot.chat(
        message=req.message,
        aws_context=context,
        mode=req.mode or "chat",
    )

    return {
        "reply": reply,
        "mode": req.mode or "chat",
        "engine_source": engine_source,
        "region": region,
        "is_demo": sess is None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
