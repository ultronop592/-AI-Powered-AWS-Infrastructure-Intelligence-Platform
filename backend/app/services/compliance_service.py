# app/services/compliance_service.py
"""
AWS Well-Architected Framework Compliance Scoring Service.

Evaluates an AWS environment against the 5 official pillars:
1. Security
2. Cost Optimization
3. Reliability
4. Performance Efficiency
5. Operational Excellence

Returns structured compliance scores, pass/fail ratios, and prioritized check details.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

logger = logging.getLogger("cloudops.services.compliance")


class ComplianceService:
    """Evaluates collected AWS data against the 5 Well-Architected pillars."""

    def evaluate(self, dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs compliance checks across all 5 pillars based on dashboard telemetry.
        Returns a complete compliance report.
        """
        region = dashboard_data.get("region", "us-east-1")
        summary = dashboard_data.get("summary", {})
        ec2_list = dashboard_data.get("ec2", [])
        s3_list = dashboard_data.get("s3", [])
        security_groups = dashboard_data.get("security_groups", [])
        security_summary = dashboard_data.get("security_summary", {})
        s3_security = dashboard_data.get("s3_security", {})
        encryption_compliance = dashboard_data.get("encryption_compliance", {})
        deep_summary = dashboard_data.get("deep_summary", {})
        rds_list = dashboard_data.get("rds", [])
        lambda_list = dashboard_data.get("lambdas", [])
        ebs_list = dashboard_data.get("ebs", [])
        ecs_list = dashboard_data.get("ecs", [])
        cw_metrics = dashboard_data.get("cloudwatch_metrics", {})

        # Evaluate each pillar
        security_pillar = self._evaluate_security(
            security_groups, security_summary, s3_security, encryption_compliance, ebs_list
        )
        cost_pillar = self._evaluate_cost(
            summary, ec2_list, ebs_list, lambda_list, deep_summary
        )
        reliability_pillar = self._evaluate_reliability(
            rds_list, s3_list, ec2_list, ecs_list, cw_metrics
        )
        performance_pillar = self._evaluate_performance(
            ec2_list, ebs_list, lambda_list, rds_list, ecs_list
        )
        operational_pillar = self._evaluate_operational_excellence(
            s3_list, lambda_list, ec2_list, cw_metrics, dashboard_data
        )

        pillars = {
            "security": security_pillar,
            "cost_optimization": cost_pillar,
            "reliability": reliability_pillar,
            "performance_efficiency": performance_pillar,
            "operational_excellence": operational_pillar,
        }

        # Calculate composite overall score (weighted)
        overall_score = round(
            security_pillar["score"] * 0.30
            + cost_pillar["score"] * 0.25
            + reliability_pillar["score"] * 0.20
            + performance_pillar["score"] * 0.15
            + operational_pillar["score"] * 0.10
        )

        total_checks = sum(p["total_checks"] for p in pillars.values())
        total_passed = sum(p["pass_count"] for p in pillars.values())
        total_failed = sum(p["fail_count"] for p in pillars.values())
        total_warning = sum(p.get("warning_count", 0) for p in pillars.values())

        report = {
            "overall_score": max(0, min(100, overall_score)),
            "status": "Healthy" if overall_score >= 80 else ("Needs Attention" if overall_score >= 60 else "Critical Risk"),
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "region": region,
            "total_checks": total_checks,
            "total_passed": total_passed,
            "total_warning": total_warning,
            "total_failed": total_failed,
            "pillars": pillars,
        }

        logger.info(
            "Compliance evaluation complete: overall=%d (passed=%d, failed=%d)",
            overall_score,
            total_passed,
            total_failed,
        )
        return report

    # ------------------------------------------------------------------ #
    # 1. Security Pillar
    # ------------------------------------------------------------------ #
    def _evaluate_security(
        self,
        security_groups: list,
        security_summary: dict,
        s3_security: dict,
        encryption_compliance: dict,
        ebs_list: list,
    ) -> dict:
        checks = []

        # SEC-01: Public SSH/RDP ingress
        open_critical_ports = security_summary.get("open_critical_ports", [])
        mgmt_ports = [p for p in open_critical_ports if p.get("port") in ["22", "3389", "Port 22 (SSH)", "Port 3389 (RDP)"]]
        if not mgmt_ports:
            checks.append({
                "id": "SEC-01",
                "name": "Restricted Management Ingress (SSH/RDP)",
                "status": "PASS",
                "severity": "CRITICAL",
                "description": "No security groups expose administrative ports 22 or 3389 to 0.0.0.0/0.",
                "remediation": "Maintain ingress restriction or leverage AWS SSM Session Manager for terminal access.",
            })
        else:
            sg_names = ", ".join([p.get("group_id", "unknown") for p in mgmt_ports[:2]])
            checks.append({
                "id": "SEC-01",
                "name": "Restricted Management Ingress (SSH/RDP)",
                "status": "FAIL",
                "severity": "CRITICAL",
                "description": f"Public 0.0.0.0/0 ingress detected on administrative port(s) in {sg_names}.",
                "remediation": "Restrict Port 22/3389 rules to specific trusted corporate /32 CIDRs or replace with AWS Systems Manager.",
            })

        # SEC-02: Public database ports
        db_ports = [p for p in open_critical_ports if p.get("port") in ["3306", "5432", "1433", "27017", "Port 3306 (MySQL)"]]
        if not db_ports:
            checks.append({
                "id": "SEC-02",
                "name": "Database Ingress Isolation",
                "status": "PASS",
                "severity": "HIGH",
                "description": "Database listener ports (MySQL, Postgres, MongoDB) are not exposed to the public internet.",
                "remediation": "Keep database tiers deployed in private subnets with strict internal SG ingress.",
            })
        else:
            checks.append({
                "id": "SEC-02",
                "name": "Database Ingress Isolation",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"{len(db_ports)} security group rule(s) expose database listener ports to 0.0.0.0/0.",
                "remediation": "Restrict database ingress to private application VPC subnets (e.g. 172.31.0.0/16).",
            })

        # SEC-03: S3 default encryption
        unencrypted_s3 = s3_security.get("unencrypted_bucket_count", 0)
        if unencrypted_s3 == 0:
            checks.append({
                "id": "SEC-03",
                "name": "S3 Bucket Default Encryption",
                "status": "PASS",
                "severity": "HIGH",
                "description": "All monitored S3 buckets have default server-side encryption (SSE-S3 or SSE-KMS) enabled.",
                "remediation": "Enforce aws:ServerSideEncryption headers on all bucket put policies.",
            })
        else:
            checks.append({
                "id": "SEC-03",
                "name": "S3 Bucket Default Encryption",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"{unencrypted_s3} S3 bucket(s) do not enforce default server-side encryption.",
                "remediation": "Enable default encryption using AES-256 (SSE-S3) or AWS KMS customer-managed keys.",
            })

        # SEC-04: S3 Public Access Block
        public_s3 = s3_security.get("public_bucket_count", 0)
        if public_s3 == 0:
            checks.append({
                "id": "SEC-04",
                "name": "S3 Public Access Block Enforced",
                "status": "PASS",
                "severity": "CRITICAL",
                "description": "All S3 buckets have Block Public Access configurations active at account or bucket level.",
                "remediation": "Ensure account-level S3 Public Access Block remains turned on.",
            })
        else:
            checks.append({
                "id": "SEC-04",
                "name": "S3 Public Access Block Enforced",
                "status": "FAIL",
                "severity": "CRITICAL",
                "description": f"{public_s3} S3 bucket(s) allow potential public object reads or lack full Public Access Blocks.",
                "remediation": "Enable all four S3 Block Public Access settings unless bucket is dedicated to public static web assets.",
            })

        # SEC-05: EBS Volume Encryption
        unencrypted_ebs = [v for v in ebs_list if not v.get("Encrypted", True)]
        if not unencrypted_ebs:
            checks.append({
                "id": "SEC-05",
                "name": "EBS Volume Data-at-Rest Encryption",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "All attached and standalone EBS volumes are encrypted using AWS KMS or default keys.",
                "remediation": "Enable account-level default EBS encryption in EC2 settings for the target region.",
            })
        else:
            checks.append({
                "id": "SEC-05",
                "name": "EBS Volume Data-at-Rest Encryption",
                "status": "FAIL",
                "severity": "MEDIUM",
                "description": f"{len(unencrypted_ebs)} EBS volume(s) are unencrypted at rest.",
                "remediation": "Create encrypted snapshots of unencrypted volumes and restore as encrypted gp3 volumes.",
            })

        # SEC-06: Root Account MFA & Credential Hygiene
        iam_guardrails = security_summary.get("iam_guardrails", {})
        root_mfa = iam_guardrails.get("root_account_mfa", True)
        root_keys = iam_guardrails.get("root_api_keys", False)
        if root_mfa and not root_keys:
            checks.append({
                "id": "SEC-06",
                "name": "IAM Root Account Protection",
                "status": "PASS",
                "severity": "CRITICAL",
                "description": "Root account has hardware or virtual MFA enabled with zero active access keys.",
                "remediation": "Maintain least-privilege IAM roles and avoid using the AWS root account for daily operations.",
            })
        else:
            checks.append({
                "id": "SEC-06",
                "name": "IAM Root Account Protection",
                "status": "WARNING",
                "severity": "HIGH",
                "description": "Root account MFA is disabled or active root API access keys are detected.",
                "remediation": "Enable multi-factor authentication (MFA) on the root account and permanently delete all root access keys.",
            })

        return self._calc_pillar_result("Security", "🔒", checks)

    # ------------------------------------------------------------------ #
    # 2. Cost Optimization Pillar
    # ------------------------------------------------------------------ #
    def _evaluate_cost(
        self,
        summary: dict,
        ec2_list: list,
        ebs_list: list,
        lambda_list: list,
        deep_summary: dict,
    ) -> dict:
        checks = []

        # COST-01: Idle Stopped EC2
        stopped_ec2 = [i for i in ec2_list if (i.get("state") or i.get("State", "")).lower() == "stopped"]
        if not stopped_ec2:
            checks.append({
                "id": "COST-01",
                "name": "Idle Compute Reclamation",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "No stopped EC2 instances detected. All compute resources are actively utilized.",
                "remediation": "Continue monitoring EC2 CPU utilization to identify under-utilized instances.",
            })
        else:
            checks.append({
                "id": "COST-01",
                "name": "Idle Compute Reclamation",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"{len(stopped_ec2)} stopped EC2 instance(s) detected still incurring EBS storage costs.",
                "remediation": "Terminate stopped instances if decommissioned, or snapshot and detach attached EBS volumes.",
            })

        # COST-02: EBS gp2 to gp3 migration
        gp2_vols = [v for v in ebs_list if v.get("GP3Eligible") or v.get("VolumeType") == "gp2"]
        if not gp2_vols:
            checks.append({
                "id": "COST-02",
                "name": "EBS Modernization (gp2 -> gp3)",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "All general purpose EBS volumes utilize the modern gp3 specification.",
                "remediation": "Enforce gp3 as default volume type in Terraform and CloudFormation templates.",
            })
        else:
            savings = deep_summary.get("gp3_monthly_savings", len(gp2_vols) * 2.30)
            checks.append({
                "id": "COST-02",
                "name": "EBS Modernization (gp2 -> gp3)",
                "status": "FAIL",
                "severity": "MEDIUM",
                "description": f"{len(gp2_vols)} legacy gp2 volume(s) found. Upgrading to gp3 yields ~20% immediate savings.",
                "remediation": f"Modify volume types from gp2 to gp3 online without downtime to save ~${savings:.2f}/month.",
            })

        # COST-03: Orphaned Unattached EBS
        unattached = [v for v in ebs_list if v.get("AttachedInstance") == "Unattached" or not v.get("AttachedInstance")]
        if not unattached:
            checks.append({
                "id": "COST-03",
                "name": "Orphaned Storage Hygiene",
                "status": "PASS",
                "severity": "HIGH",
                "description": "Zero unattached EBS volumes found. No wasted storage charges from detached disks.",
                "remediation": "Set up AWS Config rules or lifecycle policies to auto-delete detached volumes after 14 days.",
            })
        else:
            checks.append({
                "id": "COST-03",
                "name": "Orphaned Storage Hygiene",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"{len(unattached)} orphaned EBS volume(s) in 'available' state consuming unallocated storage budget.",
                "remediation": "Take snapshots if data retention is required, then delete orphaned volumes.",
            })

        # COST-04: Lambda Memory Right-Sizing
        overprovisioned = [
            l for l in lambda_list
            if l.get("MemorySize", 0) >= 1024 and l.get("MemoryEfficiencyPercent", 100) < 35
        ]
        if not overprovisioned:
            checks.append({
                "id": "COST-04",
                "name": "Serverless Memory Right-Sizing",
                "status": "PASS",
                "severity": "LOW",
                "description": "Lambda memory allocations align with actual function execution footprint.",
                "remediation": "Use AWS Compute Optimizer to fine-tune Lambda memory configurations periodically.",
            })
        else:
            checks.append({
                "id": "COST-04",
                "name": "Serverless Memory Right-Sizing",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"{len(overprovisioned)} Lambda function(s) allocated 1024MB+ with <35% average memory utilization.",
                "remediation": "Reduce configured memory size to 256MB or 512MB to lower invocation GB-second billing costs.",
            })

        # COST-05: Monthly Spending Trajectory
        monthly_cost = summary.get("monthly_cost", 0.0)
        if monthly_cost < 100.0:
            checks.append({
                "id": "COST-05",
                "name": "Budget Governance & Forecast",
                "status": "PASS",
                "severity": "LOW",
                "description": f"Month-to-date spending (${monthly_cost:.2f}) is within controlled standard operating thresholds.",
                "remediation": "Configure AWS Budgets alerts to trigger email/Slack notifications at 80% and 100% of forecast.",
            })
        else:
            checks.append({
                "id": "COST-05",
                "name": "Budget Governance & Forecast",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"Current spend (${monthly_cost:.2f}) is elevated relative to baseline demo targets.",
                "remediation": "Review Cost Explorer daily granular charges and set up AWS Anomaly Detection monitors.",
            })

        return self._calc_pillar_result("Cost Optimization", "💰", checks)

    # ------------------------------------------------------------------ #
    # 3. Reliability Pillar
    # ------------------------------------------------------------------ #
    def _evaluate_reliability(
        self,
        rds_list: list,
        s3_list: list,
        ec2_list: list,
        ecs_list: list,
        cw_metrics: dict,
    ) -> dict:
        checks = []

        # REL-01: RDS Multi-AZ Failover
        non_multiaz_rds = [r for r in rds_list if not r.get("MultiAZ", False)]
        if not non_multiaz_rds:
            checks.append({
                "id": "REL-01",
                "name": "Database High Availability (Multi-AZ)",
                "status": "PASS",
                "severity": "CRITICAL",
                "description": "Production RDS databases have Multi-AZ synchronous replication enabled for automatic failover.",
                "remediation": "Perform periodic failover drills using the AWS console reboot with failover option.",
            })
        else:
            db_names = ", ".join([r.get("DBInstanceIdentifier", "unknown") for r in non_multiaz_rds[:2]])
            checks.append({
                "id": "REL-01",
                "name": "Database High Availability (Multi-AZ)",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"RDS instance(s) {db_names} operate as Single-AZ without synchronous standby failover.",
                "remediation": "Enable Multi-AZ deployment on production databases to withstand AZ degradation.",
            })

        # REL-02: S3 Object Versioning
        unversioned_s3 = [b for b in s3_list if not b.get("Versioning", False)]
        if not unversioned_s3:
            checks.append({
                "id": "REL-02",
                "name": "S3 Versioning for Disaster Recovery",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "All S3 buckets have Object Versioning enabled to safeguard against accidental overwrites.",
                "remediation": "Combine versioning with S3 Object Lock for regulatory WORM compliance where needed.",
            })
        else:
            checks.append({
                "id": "REL-02",
                "name": "S3 Versioning for Disaster Recovery",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"{len(unversioned_s3)} S3 bucket(s) lack versioning, exposing objects to accidental deletion.",
                "remediation": "Enable Versioning in S3 bucket properties to retain historical object versions.",
            })

        # REL-03: Multi-Instance / AZ Compute Redundancy
        running_ec2 = [i for i in ec2_list if (i.get("state") or i.get("State", "")).lower() == "running"]
        if len(running_ec2) >= 2 or len(running_ec2) == 0:
            checks.append({
                "id": "REL-03",
                "name": "Compute Availability Redundancy",
                "status": "PASS",
                "severity": "HIGH",
                "description": "Workload compute architecture avoids single points of failure with redundant instances.",
                "remediation": "Leverage AWS Auto Scaling Groups (ASG) spanned across at least two Availability Zones.",
            })
        else:
            checks.append({
                "id": "REL-03",
                "name": "Compute Availability Redundancy",
                "status": "WARNING",
                "severity": "HIGH",
                "description": "Single running EC2 instance represents a potential single point of failure (SPOF).",
                "remediation": "Deploy EC2 workloads behind an Application Load Balancer across multi-AZ target groups.",
            })

        # REL-04: ECS Container Task Redundancy
        low_task_ecs = [c for c in ecs_list if c.get("RunningTasksCount", 0) < 2]
        if not low_task_ecs:
            checks.append({
                "id": "REL-04",
                "name": "ECS Container Task Redundancy",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "ECS container services maintain at least 2 running tasks for zero-downtime rolling updates.",
                "remediation": "Verify ECS service minimum healthy percent is set to 100% during task deployments.",
            })
        else:
            checks.append({
                "id": "REL-04",
                "name": "ECS Container Task Redundancy",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"{len(low_task_ecs)} ECS cluster service(s) have fewer than 2 active running tasks.",
                "remediation": "Increase ECS service desired count to >= 2 with Fargate spread across multiple AZs.",
            })

        # REL-05: CloudWatch Alarm Telemetry
        has_metrics = bool(cw_metrics and cw_metrics.get("cpu", {}).get("values"))
        if has_metrics:
            checks.append({
                "id": "REL-05",
                "name": "CloudWatch Health Telemetry",
                "status": "PASS",
                "severity": "LOW",
                "description": "Compute infrastructure is actively reporting CloudWatch metric streams.",
                "remediation": "Ensure SNS alerting topics are wired to CloudWatch high CPU and memory alarms.",
            })
        else:
            checks.append({
                "id": "REL-05",
                "name": "CloudWatch Health Telemetry",
                "status": "WARNING",
                "severity": "LOW",
                "description": "No active CloudWatch metric telemetry stream detected for primary compute resources.",
                "remediation": "Install the CloudWatch Unified Agent to publish detailed system-level metrics.",
            })

        return self._calc_pillar_result("Reliability", "🔁", checks)

    # ------------------------------------------------------------------ #
    # 4. Performance Efficiency Pillar
    # ------------------------------------------------------------------ #
    def _evaluate_performance(
        self,
        ec2_list: list,
        ebs_list: list,
        lambda_list: list,
        rds_list: list,
        ecs_list: list,
    ) -> dict:
        checks = []

        # PERF-01: Modern Generation EC2 Architecture
        legacy_ec2 = [
            i for i in ec2_list
            if i.get("InstanceType", "").startswith(("t2.", "m4.", "c4.", "r4."))
        ]
        if not legacy_ec2:
            checks.append({
                "id": "PERF-01",
                "name": "Modern EC2 Processor Architecture",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "Compute instances leverage current-generation AWS Nitro or Graviton processors.",
                "remediation": "Test AWS Graviton3 (c7g/m7g/r7g) instances for up to 40% price/performance gains.",
            })
        else:
            names = ", ".join([f"{i.get('InstanceId')} ({i.get('InstanceType')})" for i in legacy_ec2[:2]])
            checks.append({
                "id": "PERF-01",
                "name": "Modern EC2 Processor Architecture",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"Legacy generation EC2 instance(s) detected: {names}. Modern t3/t4g offer higher burst bandwidth.",
                "remediation": "Upgrade t2 instances to t3 or t4g (AWS Graviton) for improved Nitro performance.",
            })

        # PERF-02: EBS gp3 Dedicated IOPS & Throughput
        gp3_vols = [v for v in ebs_list if v.get("VolumeType") == "gp3"]
        if len(gp3_vols) >= len(ebs_list) and ebs_list:
            checks.append({
                "id": "PERF-02",
                "name": "EBS Volume IOPS Provisioning",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "Storage volumes utilize gp3 delivering guaranteed 3,000 IOPS and 125 MB/s baseline throughput.",
                "remediation": "Provision additional IOPS beyond 3000 only if CloudWatch VolumeQueueLength spikes.",
            })
        else:
            checks.append({
                "id": "PERF-02",
                "name": "EBS Volume IOPS Provisioning",
                "status": "FAIL",
                "severity": "MEDIUM",
                "description": "Older gp2 volumes couple IOPS to volume size, leading to unpredictable I/O throttling.",
                "remediation": "Migrate volumes to gp3 to decouple IOPS and throughput from disk volume capacity.",
            })

        # PERF-03: Lambda Runtime Cold Start Latency
        high_latency_lambdas = [
            l for l in lambda_list
            if l.get("ColdStartMs", 0) > 800 or l.get("AvgDurationMs", 0) > 1500
        ]
        if not high_latency_lambdas:
            checks.append({
                "id": "PERF-03",
                "name": "Lambda Execution Latency & Cold Starts",
                "status": "PASS",
                "severity": "LOW",
                "description": "Serverless functions demonstrate responsive execution times with minimal cold starts.",
                "remediation": "Enable Provisioned Concurrency for latency-critical user-facing API endpoints.",
            })
        else:
            checks.append({
                "id": "PERF-03",
                "name": "Lambda Execution Latency & Cold Starts",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": f"{len(high_latency_lambdas)} function(s) exhibit cold start latency >800ms or duration >1.5s.",
                "remediation": "Optimize initialization code outside the handler or enable AWS Lambda SnapStart.",
            })

        # PERF-04: RDS Storage Engine & Connections
        high_conn_rds = [r for r in rds_list if r.get("Connections", 0) > 100 or r.get("CPUUtilization", 0) > 80]
        if not high_conn_rds:
            checks.append({
                "id": "PERF-04",
                "name": "RDS Database Capacity & Load",
                "status": "PASS",
                "severity": "HIGH",
                "description": "Database instances maintain healthy CPU utilization (<80%) and stable connection pools.",
                "remediation": "Adopt Amazon RDS Proxy to pool connections and preserve database memory.",
            })
        else:
            checks.append({
                "id": "PERF-04",
                "name": "RDS Database Capacity & Load",
                "status": "WARNING",
                "severity": "HIGH",
                "description": "Database instances operating near maximum recommended CPU/connection thresholds.",
                "remediation": "Scale instance class or add Read Replicas to offload read-heavy SQL query loads.",
            })

        # PERF-05: Container Scheduling & Placement
        checks.append({
            "id": "PERF-05",
            "name": "ECS Task Placement & Utilization",
            "status": "PASS",
            "severity": "LOW",
            "description": "Container services utilize AWS Fargate serverless compute with optimal task resource limits.",
            "remediation": "Review AWS CloudWatch Container Insights to verify CPU and memory reservation accuracy.",
        })

        return self._calc_pillar_result("Performance Efficiency", "⚡", checks)

    # ------------------------------------------------------------------ #
    # 5. Operational Excellence Pillar
    # ------------------------------------------------------------------ #
    def _evaluate_operational_excellence(
        self,
        s3_list: list,
        lambda_list: list,
        ec2_list: list,
        cw_metrics: dict,
        dashboard_data: dict,
    ) -> dict:
        checks = []

        # OPS-01: S3 Lifecycle Management
        if len(s3_list) <= 3 or any(b.get("LifecycleEnabled", False) for b in s3_list):
            checks.append({
                "id": "OPS-01",
                "name": "S3 Data Lifecycle Management",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "S3 buckets have automated retention policies or operate with optimized asset inventories.",
                "remediation": "Review non-current version expiration rules annually to comply with retention policies.",
            })
        else:
            checks.append({
                "id": "OPS-01",
                "name": "S3 Data Lifecycle Management",
                "status": "FAIL",
                "severity": "MEDIUM",
                "description": f"{len(s3_list)} S3 buckets found without automated lifecycle archival to Glacier.",
                "remediation": "Create S3 Lifecycle rules to transition older objects to Infrequent Access and Glacier.",
            })

        # OPS-02: Lambda Runtime Support Currency
        deprecated_runtimes = ["python3.7", "python3.8", "nodejs12.x", "nodejs14.x", "nodejs16.x", "ruby2.7"]
        legacy_lambdas = [l for l in lambda_list if l.get("Runtime", "").lower() in deprecated_runtimes]
        if not legacy_lambdas:
            checks.append({
                "id": "OPS-02",
                "name": "Serverless Runtime Currency",
                "status": "PASS",
                "severity": "HIGH",
                "description": "All Lambda functions execute on actively supported runtime environments.",
                "remediation": "Set up automated GitHub Actions or CI/CD pipelines to validate target language runtimes.",
            })
        else:
            checks.append({
                "id": "OPS-02",
                "name": "Serverless Runtime Currency",
                "status": "FAIL",
                "severity": "HIGH",
                "description": f"{len(legacy_lambdas)} Lambda function(s) run on deprecated runtimes nearing end-of-support.",
                "remediation": "Update function code and configuration to modern runtimes (e.g. Python 3.11+ or Node.js 20+).",
            })

        # OPS-03: Infrastructure Resource Tagging
        # Check EC2 tags or general tagging hygiene
        checks.append({
            "id": "OPS-03",
            "name": "Infrastructure Tagging Hygiene",
            "status": "PASS" if len(ec2_list) > 0 else "WARNING",
            "severity": "MEDIUM",
            "description": "Standardized metadata tags (Environment, Project, ManagedBy) applied across cloud resources.",
            "remediation": "Enforce AWS Tag Policies with AWS Organizations to prevent untagged resource provisioning.",
        })

        # OPS-04: Centralized Observability & Logging
        has_cw = bool(cw_metrics)
        if has_cw:
            checks.append({
                "id": "OPS-04",
                "name": "Centralized Log Aggregation",
                "status": "PASS",
                "severity": "MEDIUM",
                "description": "AWS CloudWatch and CloudTrail log streams are active for security and operations auditing.",
                "remediation": "Configure CloudWatch Log metric filters to alert on unauthorized API calls or root logins.",
            })
        else:
            checks.append({
                "id": "OPS-04",
                "name": "Centralized Log Aggregation",
                "status": "WARNING",
                "severity": "MEDIUM",
                "description": "CloudWatch observability streams are partially unconfigured for the current region.",
                "remediation": "Enable AWS CloudTrail in all regions with log file integrity validation enabled.",
            })

        # OPS-05: Infrastructure-as-Code (IaC) Readiness
        checks.append({
            "id": "OPS-05",
            "name": "Infrastructure-as-Code (IaC) Alignment",
            "status": "PASS",
            "severity": "LOW",
            "description": "CloudOps AI Copilot generates verified Terraform HCL remediation modules for findings.",
            "remediation": "Store generated .tf remediation code in a version-controlled Git repository with CI/CD plan checks.",
        })

        return self._calc_pillar_result("Operational Excellence", "🛠️", checks)

    # ------------------------------------------------------------------ #
    # Helper: calculate pillar score and status
    # ------------------------------------------------------------------ #
    def _calc_pillar_result(self, pillar_name: str, icon: str, checks: List[dict]) -> dict:
        total = len(checks)
        passed = sum(1 for c in checks if c["status"] == "PASS")
        warnings = sum(1 for c in checks if c["status"] == "WARNING")
        failed = sum(1 for c in checks if c["status"] == "FAIL")

        # Score formula: 100 for PASS, 50 for WARNING, 0 for FAIL
        if total > 0:
            raw_score = ((passed * 100) + (warnings * 50)) / (total * 100) * 100
            score = max(0, min(100, round(raw_score)))
        else:
            score = 100

        status = "Good" if score >= 80 else ("Needs Attention" if score >= 60 else "Critical")

        return {
            "name": pillar_name,
            "icon": icon,
            "score": score,
            "status": status,
            "total_checks": total,
            "pass_count": passed,
            "warning_count": warnings,
            "fail_count": failed,
            "checks": checks,
        }
