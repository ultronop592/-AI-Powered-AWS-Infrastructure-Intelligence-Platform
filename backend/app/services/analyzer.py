# app/services/analyzer.py
"""
Rule-based infrastructure analyzer.

Generates prioritized recommendations from live AWS data.
Now also accepts s3_security findings for S3-specific recommendations.
"""

import logging

logger = logging.getLogger("cloudops.services.analyzer")


class Analyzer:

    def analyze(
        self,
        ec2_instances: list,
        s3_buckets: list,
        monthly_cost: float,
        security_groups: list = None,
        deep_services: dict = None,
        s3_security: dict = None,
    ) -> list:

        recommendations = []

        # ---------------------------------------------------------------- #
        # EC2: Stopped instance check
        # ---------------------------------------------------------------- #
        stopped = [
            i for i in ec2_instances
            if (i.get("state") or i.get("State", "")).lower() == "stopped"
        ]
        if stopped:
            recommendations.append({
                "id": "REC-001",
                "severity": "HIGH",
                "category": "Cost Optimization",
                "title": "Idle Stopped EC2 Instance Detected",
                "description": (
                    f"{len(stopped)} stopped EC2 instance(s) detected. "
                    "Stopped instances still incur charges for attached EBS volumes."
                ),
                "action": "Terminate idle stopped instances or detach unused EBS storage volumes to save costs.",
            })

        # ---------------------------------------------------------------- #
        # EBS: gp2 → gp3 migration + unattached volumes
        # ---------------------------------------------------------------- #
        if deep_services:
            ebs_volumes = deep_services.get("ebs", [])
            gp2_vols = [v for v in ebs_volumes if v.get("GP3Eligible")]
            unattached_ebs = [v for v in ebs_volumes if v.get("AttachedInstance") == "Unattached"]
            lambdas = deep_services.get("lambdas", [])
            overprovisioned_lambdas = [
                lmb for lmb in lambdas
                if lmb.get("MemorySize", 0) >= 1024 and lmb.get("MemoryEfficiencyPercent", 100) < 35
            ]

            if gp2_vols:
                total_savings = sum(v.get("MonthlySavingsUSD", 0.0) for v in gp2_vols)
                vol_ids = [v.get("VolumeId", "") for v in gp2_vols if v.get("VolumeId")]
                recommendations.append({
                    "id": "EBS-001",
                    "severity": "MEDIUM",
                    "category": "EBS Storage Optimization",
                    "title": "Migrate Legacy EBS gp2 Volumes to gp3",
                    "description": (
                        f"{len(gp2_vols)} legacy gp2 EBS volume(s) identified. "
                        "Migrating to gp3 provides 20% lower cost per GB with baseline 3000 IOPS."
                    ),
                    "action": f"Convert volume type from gp2 to gp3 to save estimated ~${total_savings:.2f}/month instantly.",
                    "resource_id": vol_ids[0] if vol_ids else "",
                    "affected_resources": vol_ids,
                    "remediation_available": True,
                    "remediation_action": "UPGRADE_EBS_GP3",
                })

            if unattached_ebs:
                unattached_ids = [v.get("VolumeId", "") for v in unattached_ebs if v.get("VolumeId")]
                recommendations.append({
                    "id": "EBS-002",
                    "severity": "HIGH",
                    "category": "Cost Optimization",
                    "title": "Orphaned Unattached EBS Volume Detected",
                    "description": (
                        f"{len(unattached_ebs)} unattached EBS volume(s) currently in available "
                        "state generating storage charges."
                    ),
                    "action": "Delete unattached EBS volumes or create a snapshot backup before deletion.",
                    "resource_id": unattached_ids[0] if unattached_ids else "",
                    "affected_resources": unattached_ids,
                    "remediation_available": False,
                })

            if overprovisioned_lambdas:
                names = ", ".join([lmb.get("FunctionName", "unknown") for lmb in overprovisioned_lambdas])
                recommendations.append({
                    "id": "LAM-001",
                    "severity": "MEDIUM",
                    "category": "Serverless Efficiency",
                    "title": "Over-Provisioned Lambda Function Memory",
                    "description": (
                        f"Lambda function(s) {names} allocated 1024MB+ memory "
                        "with <35% average utilization efficiency."
                    ),
                    "action": "Rightsize Lambda memory allocation to 256MB or 512MB to reduce execution cost.",
                    "remediation_available": False,
                })

        # ---------------------------------------------------------------- #
        # Security Groups
        # ---------------------------------------------------------------- #
        if security_groups:
            critical_sgs = [sg for sg in security_groups if sg.get("RiskLevel") == "CRITICAL"]
            high_sgs = [sg for sg in security_groups if sg.get("RiskLevel") == "HIGH"]

            if critical_sgs:
                sg_ids_list = [sg.get("GroupId", "") for sg in critical_sgs if sg.get("GroupId")]
                sg_ids = ", ".join(sg_ids_list)
                recommendations.append({
                    "id": "SEC-001",
                    "severity": "HIGH",
                    "category": "Security Guardrails",
                    "title": "CRITICAL: Publicly Exposed Management Port (SSH/RDP)",
                    "description": (
                        f"Security Group(s) {sg_ids} allow unrestricted 0.0.0.0/0 inbound access "
                        "on Port 22 (SSH) or Port 3389 (RDP)."
                    ),
                    "action": (
                        "Restrict inbound SSH/RDP access to specific trusted IP CIDRs "
                        "or AWS Systems Manager Session Manager."
                    ),
                    "resource_id": sg_ids_list[0] if sg_ids_list else "",
                    "affected_resources": sg_ids_list,
                    "remediation_available": True,
                    "remediation_action": "RESTRICT_INGRESS_MANAGEMENT",
                })

            if high_sgs:
                sg_ids_list = [sg.get("GroupId", "") for sg in high_sgs if sg.get("GroupId")]
                sg_ids = ", ".join(sg_ids_list)
                recommendations.append({
                    "id": "SEC-002",
                    "severity": "HIGH",
                    "category": "Security Guardrails",
                    "title": "Unprotected Database Port Exposure",
                    "description": (
                        f"Security Group(s) {sg_ids} expose database listener ports "
                        "(MySQL/PostgreSQL/MongoDB) to 0.0.0.0/0."
                    ),
                    "action": "Restrict database ingress rules to internal application subnet CIDRs (e.g. 172.31.0.0/16).",
                    "resource_id": sg_ids_list[0] if sg_ids_list else "",
                    "affected_resources": sg_ids_list,
                    "remediation_available": False,
                })

        # ---------------------------------------------------------------- #
        # S3 Security findings
        # ---------------------------------------------------------------- #
        if s3_security:
            unencrypted = s3_security.get("unencrypted_bucket_count", 0)
            public = s3_security.get("public_bucket_count", 0)
            violations = s3_security.get("s3_violations", [])

            if unencrypted > 0:
                bucket_names = [v["bucket"] for v in violations if v.get("finding", "").startswith("No default") and v.get("bucket")]
                recommendations.append({
                    "id": "S3-001",
                    "severity": "HIGH",
                    "category": "S3 Security",
                    "title": "Unencrypted S3 Bucket Detected",
                    "description": (
                        f"{unencrypted} S3 bucket(s) ({', '.join(bucket_names[:3])}) "
                        "have no default encryption configured."
                    ),
                    "action": "Enable S3 Default Encryption (SSE-S3 or SSE-KMS) on all buckets.",
                    "resource_id": bucket_names[0] if bucket_names else "",
                    "affected_resources": bucket_names,
                    "remediation_available": True,
                    "remediation_action": "ENABLE_S3_ENCRYPTION",
                })

            if public > 0:
                public_bucket_names = [v["bucket"] for v in violations if "public" in v.get("finding", "").lower() and v.get("bucket")]
                recommendations.append({
                    "id": "S3-002",
                    "severity": "HIGH",
                    "category": "S3 Security",
                    "title": "Public S3 Bucket Access Detected",
                    "description": f"{public} S3 bucket(s) do not have all public access block settings enabled.",
                    "action": "Enable all four Public Access Block settings on every S3 bucket unless intentionally public.",
                    "resource_id": public_bucket_names[0] if public_bucket_names else (s3_buckets[0].get("Name") if s3_buckets else ""),
                    "affected_resources": public_bucket_names,
                    "remediation_available": True,
                    "remediation_action": "ENABLE_S3_PUBLIC_ACCESS_BLOCK",
                })

        # ---------------------------------------------------------------- #
        # S3 lifecycle (large bucket inventory)
        # ---------------------------------------------------------------- #
        if len(s3_buckets) > 5:
            recommendations.append({
                "id": "REC-002",
                "severity": "MEDIUM",
                "category": "Storage Policy",
                "title": "Enable S3 Lifecycle Rule for Log Retention",
                "description": "Bucket inventory exceeds 5 buckets with non-current object versions older than 90 days.",
                "action": "Configure S3 Lifecycle policy to transition objects to Amazon Glacier Flexible Retrieval.",
            })

        # ---------------------------------------------------------------- #
        # Cost threshold
        # ---------------------------------------------------------------- #
        if monthly_cost > 20:
            recommendations.append({
                "id": "REC-003",
                "severity": "MEDIUM",
                "category": "Cost Optimization",
                "title": "AWS Monthly Budget Spend Threshold Exceeded",
                "description": f"Monthly AWS spending is currently ${monthly_cost:.2f}, exceeding the $20 basic threshold.",
                "action": "Review top spending AWS services in Cost Explorer to identify optimization opportunities.",
            })

        logger.info("Analyzer produced %d recommendations", len(recommendations))
        return recommendations
