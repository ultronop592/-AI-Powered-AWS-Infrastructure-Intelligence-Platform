# app/api/remediation.py
"""
FastAPI endpoints for AIOps Auto-Remediation (Phase 2, Feature 2.1).

Endpoints:
  POST /remediation/apply       — Apply one-click auto-remediation for a finding
  GET  /remediation/audit-log   — Retrieve recent remediation audit trail logs
  GET  /remediation/supported   — List all supported auto-remediations & metadata
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.remediation_service import remediation_service
from app.sessions.session_store import session_store

logger = logging.getLogger("cloudops.api.remediation")

router = APIRouter(prefix="/remediation", tags=["Remediation"])


class ApplyRemediationRequest(BaseModel):
    finding_id: str = Field(..., description="Finding identifier (e.g. SEC-001, EBS-001, S3-001, S3-002)")
    resource_id: str = Field(..., description="Target AWS resource identifier (e.g. sg-xxx, vol-xxx, bucket-name)")
    session_token: Optional[str] = Field(None, description="Optional session UUID token (can also be passed in X-Session-Token header)")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional parameters (e.g. target_cidr, revoke_only)")


@router.post("/apply")
def apply_remediation(
    req: ApplyRemediationRequest,
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    """
    Execute one-click auto-remediation for an infrastructure finding.

    If an active AWS session token is provided, applies changes directly
    to the user's AWS account using boto3 and records an audit log.
    If no session is found, executes in Demo Mode with simulated verification.
    """
    token = req.session_token or x_session_token
    sess = session_store.get(token) if token else None

    is_demo = sess is None
    boto3_session = sess.boto3_session if sess else None
    region = sess.region if sess else "us-east-1"
    account_id = sess.account_id if sess else None

    logger.info(
        "Received remediation request: finding=%s resource=%s is_demo=%s",
        req.finding_id,
        req.resource_id,
        is_demo,
    )

    try:
        result = remediation_service.apply_remediation(
            finding_id=req.finding_id,
            resource_id=req.resource_id,
            boto3_session=boto3_session,
            region=region,
            account_id=account_id,
            is_demo=is_demo,
            parameters=req.parameters,
        )
        return {
            "success": True,
            **result,
        }
    except ValueError as val_err:
        logger.warning("Invalid remediation request: %s", val_err)
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        logger.error("Remediation execution failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Remediation failed: {str(exc)}")


@router.get("/audit-log")
def get_audit_log(
    limit: int = Query(default=50, ge=1, le=200, description="Max number of audit log entries to return"),
):
    """
    Retrieve audit trail of all remediations executed during the server session.
    """
    entries = remediation_service.get_audit_log(limit=limit)
    return {
        "total": len(entries),
        "audit_logs": entries,
    }


@router.get("/supported")
def get_supported():
    """
    Retrieve all supported finding remediations and their boto3 details.
    """
    items = remediation_service.get_supported_remediations()
    return {
        "count": len(items),
        "supported_remediations": items,
    }
