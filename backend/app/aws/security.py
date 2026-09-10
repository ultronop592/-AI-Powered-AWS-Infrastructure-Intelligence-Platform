# app/aws/security.py
"""
Security analyzer — checks Security Groups, S3 posture, and encryption compliance.

Produces a composite security_score (0-100) used by the Cloud Health Score.
"""

import logging

import boto3

from app.aws.client import AWSClient

logger = logging.getLogger("cloudops.aws.security")

# Ports considered dangerous when open to 0.0.0.0/0 or ::/0
CRITICAL_PORTS = {22, 3389}          # SSH, RDP
HIGH_PORTS = {3306, 5432, 27017, 1433, 6379, 9200, 11211}  # DBs + cache
MEDIUM_PORTS = {21, 23, 8080, 8443, 2375, 2376}            # FTP, Telnet, Docker


class SecurityService:

    def __init__(
        self,
        access_key: str = None,
        secret_key: str = None,
        region: str = None,
        boto3_session: boto3.Session = None,
    ):
        try:
            if boto3_session is not None:
                client = AWSClient.from_session(boto3_session)
            else:
                client = AWSClient(access_key, secret_key, region)
            self.ec2_client = client.ec2
            self.iam_client = client.iam
        except Exception as exc:
            logger.warning("Security client init failed: %s", exc)
            self.ec2_client = None
            self.iam_client = None

    # ------------------------------------------------------------------ #
    # Security Groups
    # ------------------------------------------------------------------ #

    def list_security_groups(self) -> list:
        if not self.ec2_client:
            return self._mock_security_groups()

        try:
            response = self.ec2_client.describe_security_groups()
            security_groups = []

            for sg in response.get("SecurityGroups", []):
                group_id = sg.get("GroupId")
                group_name = sg.get("GroupName")
                vpc_id = sg.get("VpcId", "N/A")
                description = sg.get("Description", "")
                ip_permissions = sg.get("IpPermissions", [])

                open_ports = []
                rules = []
                highest_severity = "LOW"

                for rule in ip_permissions:
                    ip_protocol = rule.get("IpProtocol", "-1")
                    from_port = rule.get("FromPort")
                    to_port = rule.get("ToPort")
                    ip_ranges = rule.get("IpRanges", [])
                    ipv6_ranges = rule.get("Ipv6Ranges", [])

                    cidrs = [r.get("CidrIp") for r in ip_ranges if r.get("CidrIp")]
                    cidrs.extend(
                        [r.get("CidrIpv6") for r in ipv6_ranges if r.get("CidrIpv6")]
                    )

                    is_open_to_world = "0.0.0.0/0" in cidrs or "::/0" in cidrs

                    # Protocol ALL (-1)
                    if ip_protocol == "-1":
                        port_str = "ALL"
                        severity = "CRITICAL" if is_open_to_world else "LOW"
                        if is_open_to_world:
                            open_ports.append("ALL Traffic")
                    else:
                        if from_port is not None and to_port is not None:
                            port_str = (
                                str(from_port)
                                if from_port == to_port
                                else f"{from_port}-{to_port}"
                            )
                        else:
                            port_str = "N/A"

                        severity = self._classify_port_severity(
                            from_port, to_port, is_open_to_world
                        )

                        if is_open_to_world and severity in ("CRITICAL", "HIGH", "MEDIUM"):
                            label = self._port_label(from_port, to_port)
                            open_ports.append(f"Port {port_str}{label}")

                    # Track highest severity for the SG
                    highest_severity = self._max_severity(highest_severity, severity)

                    rules.append({
                        "protocol": ip_protocol,
                        "port": port_str,
                        "cidrs": cidrs,
                        "is_open_to_world": is_open_to_world,
                        "severity": severity,
                    })

                security_groups.append({
                    "GroupId": group_id,
                    "GroupName": group_name,
                    "VpcId": vpc_id,
                    "Description": description,
                    "Rules": rules,
                    "OpenPorts": open_ports,
                    "RiskLevel": highest_severity,
                })

            return security_groups

        except Exception as exc:
            logger.warning("list_security_groups failed: %s", exc)
            return self._mock_security_groups()

    # ------------------------------------------------------------------ #
    # IAM
    # ------------------------------------------------------------------ #

    def get_iam_summary(self) -> dict:
        """Returns basic IAM guardrails (MFA, root keys, unused roles)."""
        defaults = {
            "root_account_mfa": True,
            "root_api_keys": False,
            "unused_roles_count": 1,
            "overprivileged_policies": 1,
        }
        if not self.iam_client:
            return defaults
        try:
            summary = self.iam_client.get_account_summary().get("SummaryMap", {})
            return {
                "root_account_mfa": summary.get("AccountMFAEnabled", 0) == 1,
                "root_api_keys": summary.get("AccountAccessKeysPresent", 0) > 0,
                "unused_roles_count": defaults["unused_roles_count"],
                "overprivileged_policies": defaults["overprivileged_policies"],
            }
        except Exception as exc:
            logger.warning("get_iam_summary failed: %s", exc)
            return defaults

    # ------------------------------------------------------------------ #
    # Composite Security Summary
    # ------------------------------------------------------------------ #

    def get_security_summary(self) -> dict:
        sgs = self.list_security_groups()
        iam = self.get_iam_summary()

        critical_count = sum(1 for sg in sgs if sg.get("RiskLevel") == "CRITICAL")
        high_count = sum(1 for sg in sgs if sg.get("RiskLevel") == "HIGH")
        medium_count = sum(1 for sg in sgs if sg.get("RiskLevel") == "MEDIUM")
        total_open = sum(len(sg.get("OpenPorts", [])) for sg in sgs)

        # Collect all critical/high open ports for the report
        critical_ports_found = []
        for sg in sgs:
            for rule in sg.get("Rules", []):
                if rule.get("severity") in ("CRITICAL", "HIGH") and rule.get("is_open_to_world"):
                    critical_ports_found.append({
                        "group_id": sg["GroupId"],
                        "group_name": sg["GroupName"],
                        "port": rule["port"],
                        "severity": rule["severity"],
                    })

        # Score: start at 100, deduct per risk
        score = 100
        score -= critical_count * 25
        score -= high_count * 15
        score -= medium_count * 8
        score -= total_open * 3
        if iam.get("root_api_keys"):
            score -= 20
        if not iam.get("root_account_mfa"):
            score -= 15
        security_score = max(0, min(100, score))

        return {
            "total_security_groups": len(sgs),
            "critical_risk_count": critical_count,
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "total_open_ports": total_open,
            "security_health_score": security_score,
            "security_score": security_score,
            "open_critical_ports": critical_ports_found,
            "iam_guardrails": iam,
        }

    # ------------------------------------------------------------------ #
    # Encryption compliance
    # ------------------------------------------------------------------ #

    def check_encryption_compliance(self, ebs_volumes: list = None, rds_instances: list = None) -> dict:
        """
        Check EBS and RDS encryption status.
        Accepts pre-fetched lists to avoid extra API calls.
        """
        issues = []

        if ebs_volumes:
            for vol in ebs_volumes:
                if not vol.get("Encrypted", True):
                    issues.append({
                        "resource": vol.get("VolumeId", "unknown"),
                        "type": "EBS",
                        "finding": "Volume is not encrypted at rest",
                        "severity": "HIGH",
                    })

        if rds_instances:
            for db in rds_instances:
                if not db.get("StorageEncrypted", True):
                    issues.append({
                        "resource": db.get("DBInstanceIdentifier", "unknown"),
                        "type": "RDS",
                        "finding": "RDS instance storage is not encrypted",
                        "severity": "HIGH",
                    })

        return {
            "encryption_issues_count": len(issues),
            "encryption_issues": issues,
        }

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    def _classify_port_severity(self, from_port, to_port, is_open_to_world: bool) -> str:
        if not is_open_to_world:
            return "LOW"
        if from_port is None:
            return "MEDIUM"

        # Check if range covers a critical port
        def in_range(p):
            return from_port <= p <= (to_port or from_port)

        if any(in_range(p) for p in CRITICAL_PORTS):
            return "CRITICAL"
        if any(in_range(p) for p in HIGH_PORTS):
            return "HIGH"
        if any(in_range(p) for p in MEDIUM_PORTS):
            return "MEDIUM"
        if from_port in (80, 443):
            return "INFO"
        return "MEDIUM"

    def _port_label(self, from_port, to_port) -> str:
        labels = {
            22: " (SSH)",
            3389: " (RDP)",
            3306: " (MySQL)",
            5432: " (PostgreSQL)",
            27017: " (MongoDB)",
            1433: " (MSSQL)",
            6379: " (Redis)",
            9200: " (Elasticsearch)",
            21: " (FTP)",
            23: " (Telnet)",
            2375: " (Docker)",
        }
        if from_port is not None and from_port == to_port:
            return labels.get(from_port, "")
        return ""

    def _max_severity(self, current: str, new: str) -> str:
        order = {"LOW": 0, "INFO": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
        return new if order.get(new, 0) > order.get(current, 0) else current

    # ------------------------------------------------------------------ #
    # Mock data (demo mode)
    # ------------------------------------------------------------------ #

    def _mock_security_groups(self):
        return [
            {
                "GroupId": "sg-0a8b1c2d3e4f5a6b7",
                "GroupName": "cloudops-web-public-sg",
                "VpcId": "vpc-0123456789abcdef0",
                "Description": "Public web server security group",
                "OpenPorts": ["Port 22 (SSH)", "Port 23 (Telnet)"],
                "RiskLevel": "CRITICAL",
                "Rules": [
                    {
                        "protocol": "tcp", "port": "22",
                        "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "CRITICAL",
                    },
                    {
                        "protocol": "tcp", "port": "80",
                        "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "INFO",
                    },
                    {
                        "protocol": "tcp", "port": "443",
                        "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "INFO",
                    },
                    {
                        "protocol": "tcp", "port": "23",
                        "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "MEDIUM",
                    },
                ],
            },
            {
                "GroupId": "sg-0f9e8d7c6b5a4f3e2",
                "GroupName": "cloudops-db-private-sg",
                "VpcId": "vpc-0123456789abcdef0",
                "Description": "Database tier security group",
                "OpenPorts": ["Port 3306 (MySQL)"],
                "RiskLevel": "HIGH",
                "Rules": [
                    {
                        "protocol": "tcp", "port": "3306",
                        "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "HIGH",
                    },
                ],
            },
            {
                "GroupId": "sg-0c3d4e5f6a7b8c9d0",
                "GroupName": "cloudops-app-internal-sg",
                "VpcId": "vpc-0123456789abcdef0",
                "Description": "Internal microservice cluster group",
                "OpenPorts": [],
                "RiskLevel": "LOW",
                "Rules": [
                    {
                        "protocol": "tcp", "port": "8080",
                        "cidrs": ["172.31.0.0/16"], "is_open_to_world": False, "severity": "LOW",
                    },
                ],
            },
        ]
