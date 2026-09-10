# app/api/auth_aws.py
"""
AWS authentication endpoints.

POST /aws/verify   — validates credentials via STS, creates a server-side
                     session, returns a session_token UUID.
DELETE /aws/session — invalidates a session.
GET /aws/session/status — returns session validity info.

Raw AWS credentials are NEVER stored and NEVER need to be sent again
after the initial verify call.
"""

import logging

import boto3
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.aws.client import AWSClient
from app.sessions.session_store import session_store

logger = logging.getLogger("cloudops.api.auth")

router = APIRouter(prefix="/aws", tags=["AWS Auth"])


class VerifyCredentialsRequest(BaseModel):
    access_key: str
    secret_key: str
    region: Optional[str] = "us-east-1"


# ---------------------------------------------------------------------------
# POST /aws/verify — validate credentials, create session
# ---------------------------------------------------------------------------

@router.post("/verify")
def verify_aws_credentials(req: VerifyCredentialsRequest):
    if not req.access_key or not req.secret_key:
        raise HTTPException(
            status_code=400,
            detail="Access Key ID and Secret Access Key are required.",
        )

    region = (req.region or "us-east-1").strip()
    access_key = req.access_key.strip()
    secret_key = req.secret_key.strip()

    try:
        # Build a temporary boto3 session solely for STS validation
        temp_session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
        sts = temp_session.client("sts")
        caller = sts.get_caller_identity()

        account_id = caller.get("Account", "")
        arn = caller.get("Arn", "")

        # STS validation succeeded — persist session server-side
        session_token = session_store.create(
            boto3_session=temp_session,
            account_id=account_id,
            arn=arn,
            region=region,
        )

        logger.info("AWS session created: account=%s arn=%s region=%s", account_id, arn, region)

        return {
            "valid": True,
            "session_token": session_token,
            "account_id": account_id,
            "arn": arn,
            "region": region,
            "message": f"Successfully connected to AWS Account {account_id}",
        }

    except Exception as exc:
        logger.warning("AWS credential verification failed: %s", exc)
        raise HTTPException(
            status_code=401,
            detail=f"AWS Authentication Failed: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# DELETE /aws/session — invalidate a session
# ---------------------------------------------------------------------------

@router.delete("/session")
def disconnect_session(
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    if not x_session_token:
        raise HTTPException(status_code=400, detail="X-Session-Token header is required.")

    removed = session_store.delete(x_session_token)
    if removed:
        logger.info("Session %s disconnected.", x_session_token[:8] + "***")
        return {"disconnected": True, "message": "AWS session invalidated. Platform returned to Demo Mode."}
    return {"disconnected": False, "message": "Session not found or already expired."}


# ---------------------------------------------------------------------------
# GET /aws/session/status — check if a session is still valid
# ---------------------------------------------------------------------------

@router.get("/session/status")
def session_status(
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    if not x_session_token:
        return {"valid": False, "is_demo": True}

    sess = session_store.get(x_session_token)
    if not sess:
        return {"valid": False, "is_demo": True, "reason": "expired_or_not_found"}

    return {
        "valid": True,
        "is_demo": False,
        **sess.to_info(),
    }
