# app/api/graph.py
"""
Resource Dependency Graph API endpoint.

Constructs an interactive node-and-edge topological graph of the connected
AWS environment, mapping relationships between VPCs, Security Groups,
EC2 instances, EBS volumes, RDS databases, S3 buckets, and Lambda functions.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Header

from app.aws.relationships import RelationshipService
from app.services.dashboard_service import DashboardService
from app.sessions.session_store import session_store

logger = logging.getLogger("cloudops.api.graph")

router = APIRouter(prefix="/graph", tags=["Resource Graph"])
dashboard_service = DashboardService()
relationship_service = RelationshipService()


@router.get("/")
def get_graph(
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token"),
):
    """
    Returns topological graph nodes and edges for the active AWS session or demo mode.
    """
    sess = session_store.get(x_session_token) if x_session_token else None

    if sess:
        logger.info("Generating resource graph for account=%s region=%s", sess.account_id, sess.region)
        dashboard_data = dashboard_service.get_dashboard(
            boto3_session=sess.boto3_session,
            region=sess.region,
            is_demo=False,
        )
        region = sess.region
        is_demo = False
    else:
        logger.info("Generating resource graph in demo mode")
        dashboard_data = dashboard_service.get_dashboard(
            boto3_session=None,
            region=None,
            is_demo=True,
        )
        region = dashboard_data.get("region", "us-east-1")
        is_demo = True

    graph_payload = relationship_service.build_graph(dashboard_data)

    return {
        **graph_payload,
        "region": region,
        "is_demo": is_demo,
    }
