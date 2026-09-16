# app/services/remediation_service.py
"""
Remediation Service — AIOps Auto-Remediation Engine (Phase 2, Feature 2.1).

Performs autonomous or one-click AWS infrastructure remediation using boto3.
Supports:
  1. Live AWS execution: Uses authenticated boto3.Session from session_store
     to invoke AWS EC2 and S3 mutation APIs directly.
  2. Demo Mode simulation: Returns verified mock audit receipt with realistic
     latency and zero side-effects when running without live AWS credentials.
  3. Audit Logging: Thread-safe in-memory audit trail recording every remediation
     with unique UUIDs, timestamps, AWS account IDs, and action summaries.
  4. Cache Invalidation: Automatically busts the DashboardService response cache
     so the next dashboard fetch reflects real, live changes immediately.
"""

import logging
import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError

from app.services.dashboard_service import invalidate_dashboard_cache

logger = logging.getLogger("cloudops.services.remediation")


SUPPORTED_REMEDIATIONS = {
    "SEC-001": {
        "finding_id": "SEC-001",
        "title": "Publicly Exposed Management Port (SSH/RDP)",
        "category": "Security Guardrails",
        "service": "Amazon EC2",
        "action_description": "Revoke 0.0.0.0/0 ingress on Port 22/3389 and optionally authorize restricted CIDR",
        "boto3_api": "ec2.revoke_security_group_ingress & ec2.authorize_security_group_ingress",
        "severity": "HIGH",
        "target_resource_type": "Security Group ID (e.g. sg-0abc123)",
    },
    "EBS-001": {
        "finding_id": "EBS-001",
        "title": "Migrate Legacy EBS gp2 Volumes to gp3",
        "category": "EBS Storage Optimization",
        "service": "Amazon EBS",
        "action_description": "Upgrade volume type from gp2 to gp3 online with 0 downtime for 20% cost reduction",
        "boto3_api": "ec2.modify_volume(VolumeId, VolumeType='gp3')",
        "severity": "MEDIUM",
        "target_resource_type": "EBS Volume ID (e.g. vol-0abc123)",
    },
    "S3-001": {
        "finding_id": "S3-001",
        "title": "Unencrypted S3 Bucket Detected",
        "category": "S3 Security",
        "service": "Amazon S3",
        "action_description": "Enforce AES-256 (SSE-S3) default server-side encryption with bucket keys enabled",
        "boto3_api": "s3.put_bucket_encryption(Bucket, ServerSideEncryptionConfiguration)",
        "severity": "HIGH",
        "target_resource_type": "S3 Bucket Name",
    },
    "S3-002": {
        "finding_id": "S3-002",
        "title": "Public S3 Bucket Access Detected",
        "category": "S3 Security",
        "service": "Amazon S3",
        "action_description": "Enable all 4 S3 Public Access Block settings (BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets)",
        "boto3_api": "s3.put_public_access_block(Bucket, PublicAccessBlockConfiguration)",
        "severity": "HIGH",
        "target_resource_type": "S3 Bucket Name",
    },
}


class RemediationService:
    """
    Thread-safe AIOps auto-remediation service.
    """

    def __init__(self) -> None:
        self._audit_log: List[Dict[str, Any]] = []
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def get_supported_remediations(self) -> List[Dict[str, Any]]:
        """Return metadata for all supported auto-remediations."""
        return list(SUPPORTED_REMEDIATIONS.values())

    def get_audit_log(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return recent remediation audit trail records (newest first)."""
        with self._lock:
            return list(reversed(self._audit_log[-limit:]))

    def apply_remediation(
        self,
        finding_id: str,
        resource_id: str,
        boto3_session: Optional[boto3.Session] = None,
        region: Optional[str] = None,
        account_id: Optional[str] = None,
        is_demo: bool = False,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Main entry point to execute an auto-remediation.
        """
        start_t = time.monotonic()
        target_finding = finding_id.strip().upper()
        target_resource = resource_id.strip()
        params = parameters or {}
        audit_id = f"audit-{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        meta = SUPPORTED_REMEDIATIONS.get(target_finding)
        if not meta:
            raise ValueError(
                f"Unsupported finding ID '{finding_id}'. "
                f"Supported findings are: {list(SUPPORTED_REMEDIATIONS.keys())}"
            )

        # -------------------------------------------------------------- #
        # Demo Mode execution
        # -------------------------------------------------------------- #
        if is_demo or boto3_session is None:
            logger.info("Executing remediation in DEMO simulation mode: finding=%s resource=%s", target_finding, target_resource)
            # Realistic slight latency
            time.sleep(0.25)
            result = self._execute_demo_simulation(
                finding_id=target_finding,
                resource_id=target_resource,
                meta=meta,
                parameters=params,
            )
            elapsed_ms = round((time.monotonic() - start_t) * 1000)

            audit_entry = {
                "audit_id": audit_id,
                "timestamp": timestamp,
                "finding_id": target_finding,
                "finding_title": meta["title"],
                "resource_id": target_resource,
                "action_taken": result["action_taken"],
                "status": "SUCCESS",
                "is_demo": True,
                "account_id": account_id or "Demo-Account-123456789012",
                "region": region or "us-east-1",
                "execution_time_ms": elapsed_ms,
                "details": result["details"],
            }
            with self._lock:
                self._audit_log.append(audit_entry)

            # Invalidate dashboard cache to ensure demo dashboard can refresh
            invalidate_dashboard_cache()

            return audit_entry

        # -------------------------------------------------------------- #
        # Live AWS boto3 execution
        # -------------------------------------------------------------- #
        target_region = region or boto3_session.region_name or "us-east-1"
        logger.info(
            "Executing LIVE boto3 remediation: finding=%s resource=%s account=%s region=%s",
            target_finding,
            target_resource,
            account_id,
            target_region,
        )

        try:
            if target_finding == "SEC-001":
                result = self._remediate_sec_001(
                    session=boto3_session,
                    region=target_region,
                    resource_id=target_resource,
                    parameters=params,
                )
            elif target_finding == "EBS-001":
                result = self._remediate_ebs_001(
                    session=boto3_session,
                    region=target_region,
                    resource_id=target_resource,
                )
            elif target_finding == "S3-001":
                result = self._remediate_s3_001(
                    session=boto3_session,
                    resource_id=target_resource,
                )
            elif target_finding == "S3-002":
                result = self._remediate_s3_002(
                    session=boto3_session,
                    resource_id=target_resource,
                )
            else:
                raise ValueError(f"No handler defined for finding {target_finding}")

            elapsed_ms = round((time.monotonic() - start_t) * 1000)

            audit_entry = {
                "audit_id": audit_id,
                "timestamp": timestamp,
                "finding_id": target_finding,
                "finding_title": meta["title"],
                "resource_id": target_resource,
                "action_taken": result["action_taken"],
                "status": "SUCCESS",
                "is_demo": False,
                "account_id": account_id or "live-aws",
                "region": target_region,
                "execution_time_ms": elapsed_ms,
                "details": result["details"],
            }

            with self._lock:
                self._audit_log.append(audit_entry)

            # Invalidate cached dashboard so live data reflects changes immediately
            invalidate_dashboard_cache()
            logger.info("Live remediation SUCCESS for %s: %s (took %dms)", target_resource, result["action_taken"], elapsed_ms)

            return audit_entry

        except Exception as exc:
            elapsed_ms = round((time.monotonic() - start_t) * 1000)
            err_msg = str(exc)
            logger.error("Live remediation FAILED for finding=%s resource=%s: %s", target_finding, target_resource, err_msg)

            audit_entry = {
                "audit_id": audit_id,
                "timestamp": timestamp,
                "finding_id": target_finding,
                "finding_title": meta["title"],
                "resource_id": target_resource,
                "action_taken": f"Remediation failed: {err_msg}",
                "status": "FAILED",
                "is_demo": False,
                "account_id": account_id or "unknown",
                "region": target_region,
                "execution_time_ms": elapsed_ms,
                "error": err_msg,
            }
            with self._lock:
                self._audit_log.append(audit_entry)

            raise RuntimeError(f"AWS Remediation Failed: {err_msg}") from exc

    # ------------------------------------------------------------------ #
    # Live AWS Handlers
    # ------------------------------------------------------------------ #

    def _remediate_sec_001(
        self,
        session: boto3.Session,
        region: str,
        resource_id: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        SEC-001: Restrict unrestricted 0.0.0.0/0 ingress on Port 22 (SSH) or 3389 (RDP).
        Revokes open world CIDRs (0.0.0.0/0 and ::/0).
        If new_cidr or target_cidr is provided and revoke_only is not True,
        authorizes the replacement restricted CIDR rule.
        """
        ec2 = session.client("ec2", region_name=region)
        target_cidr = parameters.get("target_cidr", "10.0.0.0/16").strip()
        revoke_only = bool(parameters.get("revoke_only", False))
        target_ports = parameters.get("ports") or [22, 3389]
        if isinstance(target_ports, int):
            target_ports = [target_ports]

        # 1. Fetch current ingress permissions
        resp = ec2.describe_security_groups(GroupIds=[resource_id])
        groups = resp.get("SecurityGroups", [])
        if not groups:
            raise ValueError(f"Security group '{resource_id}' not found in region {region}.")

        sg = groups[0]
        ip_permissions = sg.get("IpPermissions", [])

        permissions_to_revoke = []
        revoked_ports = set()

        for perm in ip_permissions:
            ip_proto = perm.get("IpProtocol", "-1")
            from_port = perm.get("FromPort")
            to_port = perm.get("ToPort")

            # Check if this rule encompasses any target ports
            matches_port = False
            if ip_proto == "-1":
                matches_port = True
            elif from_port is not None and to_port is not None:
                for p in target_ports:
                    if from_port <= p <= to_port:
                        matches_port = True
                        revoked_ports.add(p)

            if not matches_port:
                continue

            # Identify open-world IP ranges to revoke
            open_ipv4 = [r for r in perm.get("IpRanges", []) if r.get("CidrIp") == "0.0.0.0/0"]
            open_ipv6 = [r for r in perm.get("Ipv6Ranges", []) if r.get("CidrIpv6") == "::/0"]

            if open_ipv4 or open_ipv6:
                rule_to_revoke = {
                    "IpProtocol": ip_proto,
                }
                if from_port is not None:
                    rule_to_revoke["FromPort"] = from_port
                if to_port is not None:
                    rule_to_revoke["ToPort"] = to_port
                if open_ipv4:
                    rule_to_revoke["IpRanges"] = open_ipv4
                if open_ipv6:
                    rule_to_revoke["Ipv6Ranges"] = open_ipv6

                permissions_to_revoke.append(rule_to_revoke)

        # 2. Revoke dangerous rules
        revoked_count = 0
        if permissions_to_revoke:
            try:
                ec2.revoke_security_group_ingress(
                    GroupId=resource_id,
                    IpPermissions=permissions_to_revoke,
                )
                revoked_count = len(permissions_to_revoke)
                logger.info("Revoked %d open ingress rule(s) from %s", revoked_count, resource_id)
            except ClientError as ce:
                if "InvalidPermission.NotFound" not in str(ce):
                    raise

        # 3. Authorize replacement restricted rule if requested
        authorized_count = 0
        if not revoke_only and target_cidr and target_cidr != "0.0.0.0/0":
            ports_to_authorize = list(revoked_ports) if revoked_ports else [22]
            for port in ports_to_authorize:
                try:
                    ec2.authorize_security_group_ingress(
                        GroupId=resource_id,
                        IpPermissions=[
                            {
                                "IpProtocol": "tcp",
                                "FromPort": port,
                                "ToPort": port,
                                "IpRanges": [
                                    {
                                        "CidrIp": target_cidr,
                                        "Description": f"CloudOps AI restricted ingress on port {port}",
                                    }
                                ],
                            }
                        ],
                    )
                    authorized_count += 1
                except ClientError as ce:
                    # Ignore if the rule already exists
                    if "InvalidPermission.Duplicate" not in str(ce):
                        logger.warning("Error authorizing replacement rule for port %d: %s", port, ce)

        action_taken = (
            f"Revoked {revoked_count} unrestricted 0.0.0.0/0 rule(s) on {resource_id}."
        )
        if authorized_count > 0:
            action_taken += f" Authorized restricted ingress for {target_cidr} on port(s) {list(revoked_ports or [22])}."

        return {
            "action_taken": action_taken,
            "details": {
                "security_group_id": resource_id,
                "revoked_rules_count": revoked_count,
                "authorized_rules_count": authorized_count,
                "target_cidr": target_cidr if not revoke_only else None,
                "revoke_only": revoke_only,
                "revoked_ports": list(revoked_ports or [22]),
            },
        }

    def _remediate_ebs_001(
        self,
        session: boto3.Session,
        region: str,
        resource_id: str,
    ) -> Dict[str, Any]:
        """
        EBS-001: Modify legacy gp2 volume to gp3.
        Takes effect online with zero volume downtime.
        """
        ec2 = session.client("ec2", region_name=region)

        # Check existing volume type
        vol_info = ec2.describe_volumes(VolumeIds=[resource_id])
        volumes = vol_info.get("Volumes", [])
        if not volumes:
            raise ValueError(f"EBS Volume '{resource_id}' not found in region {region}.")

        vol = volumes[0]
        current_type = vol.get("VolumeType", "gp2")
        size_gb = vol.get("Size", 100)

        if current_type == "gp3":
            return {
                "action_taken": f"Volume {resource_id} is already configured as gp3.",
                "details": {
                    "volume_id": resource_id,
                    "size_gb": size_gb,
                    "volume_type": "gp3",
                    "status": "already_gp3",
                },
            }

        # Modify to gp3
        resp = ec2.modify_volume(
            VolumeId=resource_id,
            VolumeType="gp3",
        )
        mod = resp.get("VolumeModification", {})
        mod_state = mod.get("ModificationState", "modifying")

        savings_monthly = round(size_gb * (0.10 - 0.08), 2)
        action_taken = (
            f"Initiated online conversion of volume {resource_id} ({size_gb}GB) "
            f"from gp2 to gp3. Estimated savings: ~${savings_monthly:.2f}/month."
        )

        return {
            "action_taken": action_taken,
            "details": {
                "volume_id": resource_id,
                "size_gb": size_gb,
                "previous_type": current_type,
                "target_type": "gp3",
                "modification_state": mod_state,
                "estimated_monthly_savings_usd": savings_monthly,
            },
        }

    def _remediate_s3_001(
        self,
        session: boto3.Session,
        resource_id: str,
    ) -> Dict[str, Any]:
        """
        S3-001: Enforce AES-256 (SSE-S3) default server-side encryption with bucket keys.
        """
        s3 = session.client("s3")

        s3.put_bucket_encryption(
            Bucket=resource_id,
            ServerSideEncryptionConfiguration={
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256",
                        },
                        "BucketKeyEnabled": True,
                    }
                ]
            },
        )

        action_taken = f"Enabled AES-256 (SSE-S3) default encryption on bucket '{resource_id}'."

        return {
            "action_taken": action_taken,
            "details": {
                "bucket_name": resource_id,
                "encryption_algorithm": "AES256",
                "bucket_key_enabled": True,
            },
        }

    def _remediate_s3_002(
        self,
        session: boto3.Session,
        resource_id: str,
    ) -> Dict[str, Any]:
        """
        S3-002: Enable all 4 S3 Public Access Block configurations on the bucket.
        """
        s3 = session.client("s3")

        s3.put_public_access_block(
            Bucket=resource_id,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": True,
                "IgnorePublicAcls": True,
                "BlockPublicPolicy": True,
                "RestrictPublicBuckets": True,
            },
        )

        action_taken = f"Enabled all 4 Public Access Block settings on bucket '{resource_id}'."

        return {
            "action_taken": action_taken,
            "details": {
                "bucket_name": resource_id,
                "block_public_acls": True,
                "ignore_public_acls": True,
                "block_public_policy": True,
                "restrict_public_buckets": True,
            },
        }

    # ------------------------------------------------------------------ #
    # Demo Simulation Handler
    # ------------------------------------------------------------------ #

    def _execute_demo_simulation(
        self,
        finding_id: str,
        resource_id: str,
        meta: Dict[str, Any],
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Simulate remediation in Demo Mode without requiring real AWS credentials.
        """
        if finding_id == "SEC-001":
            target_cidr = parameters.get("target_cidr", "10.0.0.0/16")
            revoke_only = bool(parameters.get("revoke_only", False))
            action = f"Demo Simulation: Revoked 0.0.0.0/0 ingress on Port 22 (SSH) for {resource_id}."
            if not revoke_only:
                action += f" Re-authorized restricted CIDR {target_cidr}."
            details = {
                "simulated": True,
                "security_group_id": resource_id,
                "revoked_rules_count": 1,
                "authorized_rules_count": 0 if revoke_only else 1,
                "target_cidr": target_cidr if not revoke_only else None,
                "boto3_calls_simulated": [
                    f"ec2.revoke_security_group_ingress(GroupId='{resource_id}', IpPermissions=[...])",
                    f"ec2.authorize_security_group_ingress(GroupId='{resource_id}', CidrIp='{target_cidr}')",
                ],
            }
        elif finding_id == "EBS-001":
            action = (
                f"Demo Simulation: Upgraded EBS volume {resource_id} from gp2 to gp3. "
                "Estimated annual savings: $48.00."
            )
            details = {
                "simulated": True,
                "volume_id": resource_id,
                "previous_type": "gp2",
                "target_type": "gp3",
                "modification_state": "optimizing",
                "estimated_monthly_savings_usd": 4.00,
                "boto3_calls_simulated": [
                    f"ec2.modify_volume(VolumeId='{resource_id}', VolumeType='gp3')"
                ],
            }
        elif finding_id == "S3-001":
            action = f"Demo Simulation: Enabled AES-256 (SSE-S3) default encryption on bucket '{resource_id}'."
            details = {
                "simulated": True,
                "bucket_name": resource_id,
                "encryption_algorithm": "AES256",
                "bucket_key_enabled": True,
                "boto3_calls_simulated": [
                    f"s3.put_bucket_encryption(Bucket='{resource_id}', ServerSideEncryptionConfiguration={{...}})"
                ],
            }
        elif finding_id == "S3-002":
            action = f"Demo Simulation: Enabled all 4 Public Access Blocks on bucket '{resource_id}'."
            details = {
                "simulated": True,
                "bucket_name": resource_id,
                "block_public_acls": True,
                "ignore_public_acls": True,
                "block_public_policy": True,
                "restrict_public_buckets": True,
                "boto3_calls_simulated": [
                    f"s3.put_public_access_block(Bucket='{resource_id}', PublicAccessBlockConfiguration={{...}})"
                ],
            }
        else:
            action = f"Demo Simulation: Applied remediation for {finding_id} on {resource_id}."
            details = {"simulated": True}

        return {
            "action_taken": action,
            "details": details,
        }


# Singleton instance
remediation_service = RemediationService()
