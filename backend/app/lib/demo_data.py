# app/lib/demo_data.py
"""
Rich Demo Mode data — returned by DashboardService when no AWS session is active.

This mirrors the exact schema the live endpoint returns, ensuring the frontend
renders correctly in demo mode without any special-casing.
"""

DEMO_DASHBOARD_DATA = {
    "summary": {
        "monthly_cost": 14.67,
        "currency": "USD",
        "ec2_count": 2,
        "s3_bucket_count": 3,
        "security_health_score": 65,
        "health_score": 71,
        "rds_count": 2,
        "lambda_count": 3,
        "ebs_count": 3,
        "gp3_monthly_savings": 7.00,
    },
    "cost_by_service": [
        {"service": "Amazon EC2", "cost": 10.32},
        {"service": "Amazon S3", "cost": 1.74},
        {"service": "AWS Key Management Service", "cost": 1.15},
        {"service": "Amazon CloudWatch", "cost": 0.86},
        {"service": "AWS CloudTrail", "cost": 0.60},
    ],
    "ec2": [
        {
            "InstanceId": "i-0a123456789abcdef",
            "InstanceType": "t3.micro",
            "State": "running",
            "PublicIp": "54.210.12.98",
            "PrivateIp": "172.31.16.4",
            "Region": "us-east-1",
            "LaunchTime": "2026-07-01T10:00:00Z",
        },
        {
            "InstanceId": "i-0b987654321fedcba",
            "InstanceType": "t2.medium",
            "State": "stopped",
            "PublicIp": "N/A",
            "PrivateIp": "172.31.24.18",
            "Region": "us-east-1",
            "LaunchTime": "2026-06-15T08:30:00Z",
        },
    ],
    "s3": [
        {
            "Name": "cloudops-logs-prod-useast1",
            "CreationDate": "2026-05-10T14:22:00+00:00",
            "Region": "us-east-1",
            "Encrypted": True,
            "PublicAccess": False,
            "Versioning": True,
        },
        {
            "Name": "cloudops-assets-public",
            "CreationDate": "2026-05-12T09:15:00+00:00",
            "Region": "us-east-1",
            "Encrypted": True,
            "PublicAccess": False,
            "Versioning": False,
        },
        {
            "Name": "cloudops-backups-archive",
            "CreationDate": "2026-06-01T07:00:00+00:00",
            "Region": "us-west-2",
            "Encrypted": False,
            "PublicAccess": False,
            "Versioning": False,
        },
    ],
    "security_groups": [
        {
            "GroupId": "sg-0a8b1c2d3e4f5a6b7",
            "GroupName": "cloudops-web-public-sg",
            "VpcId": "vpc-0123456789abcdef0",
            "Description": "Public web server security group",
            "OpenPorts": ["Port 22 (SSH)", "Port 23 (Telnet)"],
            "RiskLevel": "CRITICAL",
            "Rules": [
                {"protocol": "tcp", "port": "22", "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "CRITICAL"},
                {"protocol": "tcp", "port": "80", "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "INFO"},
                {"protocol": "tcp", "port": "443", "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "INFO"},
                {"protocol": "tcp", "port": "23", "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "MEDIUM"},
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
                {"protocol": "tcp", "port": "3306", "cidrs": ["0.0.0.0/0"], "is_open_to_world": True, "severity": "HIGH"},
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
                {"protocol": "tcp", "port": "8080", "cidrs": ["172.31.0.0/16"], "is_open_to_world": False, "severity": "LOW"},
            ],
        },
    ],
    "security_summary": {
        "total_security_groups": 3,
        "critical_risk_count": 1,
        "high_risk_count": 1,
        "medium_risk_count": 1,
        "total_open_ports": 3,
        "security_health_score": 65,
        "security_score": 65,
        "open_critical_ports": [
            {"group_id": "sg-0a8b1c2d3e4f5a6b7", "group_name": "cloudops-web-public-sg", "port": "22", "severity": "CRITICAL"},
            {"group_id": "sg-0f9e8d7c6b5a4f3e2", "group_name": "cloudops-db-private-sg", "port": "3306", "severity": "HIGH"},
        ],
        "iam_guardrails": {
            "root_account_mfa": True,
            "root_api_keys": False,
            "unused_roles_count": 1,
            "overprivileged_policies": 1,
        },
    },
    "s3_security": {
        "total_buckets": 3,
        "public_bucket_count": 0,
        "unencrypted_bucket_count": 1,
        "unversioned_bucket_count": 2,
        "s3_violations": [
            {"bucket": "cloudops-backups-archive", "finding": "No default encryption configured", "severity": "HIGH"},
        ],
    },
    "encryption_compliance": {
        "encryption_issues_count": 0,
        "encryption_issues": [],
    },
    "rds": [
        {
            "DBInstanceIdentifier": "cloudops-db-prod-postgres",
            "Engine": "postgres 15.4",
            "DBInstanceClass": "db.t3.medium",
            "Status": "available",
            "MultiAZ": True,
            "AllocatedStorage": 100,
            "StorageType": "gp2",
            "Endpoint": "cloudops-db-prod.c123456789.us-east-1.rds.amazonaws.com",
            "Port": 5432,
            "CPUUtilization": 18.4,
            "Connections": 14,
        },
        {
            "DBInstanceIdentifier": "cloudops-db-staging-mysql",
            "Engine": "mysql 8.0.32",
            "DBInstanceClass": "db.t3.small",
            "Status": "available",
            "MultiAZ": False,
            "AllocatedStorage": 50,
            "StorageType": "gp2",
            "Endpoint": "cloudops-db-staging.c123456789.us-east-1.rds.amazonaws.com",
            "Port": 3306,
            "CPUUtilization": 6.2,
            "Connections": 3,
        },
    ],
    "lambdas": [
        {
            "FunctionName": "cloudops-report-generator",
            "Runtime": "python3.12",
            "MemorySize": 1024,
            "CodeSize": 4.85,
            "LastModified": "2026-07-20T14:30:00Z",
            "AvgDurationMs": 185,
            "ColdStartMs": 340,
            "ErrorRatePercent": 0.0,
            "MemoryEfficiencyPercent": 18.2,
        },
        {
            "FunctionName": "cloudops-cost-notifier",
            "Runtime": "nodejs20.x",
            "MemorySize": 256,
            "CodeSize": 1.20,
            "LastModified": "2026-07-22T09:15:00Z",
            "AvgDurationMs": 42,
            "ColdStartMs": 120,
            "ErrorRatePercent": 0.0,
            "MemoryEfficiencyPercent": 64.0,
        },
        {
            "FunctionName": "cloudops-telemetry-ingest",
            "Runtime": "python3.11",
            "MemorySize": 512,
            "CodeSize": 2.10,
            "LastModified": "2026-07-25T11:00:00Z",
            "AvgDurationMs": 95,
            "ColdStartMs": 210,
            "ErrorRatePercent": 0.2,
            "MemoryEfficiencyPercent": 42.0,
        },
    ],
    "ebs": [
        {
            "VolumeId": "vol-0a1b2c3d4e5f6g7h8",
            "SizeGB": 200,
            "VolumeType": "gp2",
            "State": "in-use",
            "AttachedInstance": "i-0a123456789abcdef",
            "GP3Eligible": True,
            "MonthlySavingsUSD": 4.00,
        },
        {
            "VolumeId": "vol-0i9h8g7f6e5d4c3b2",
            "SizeGB": 100,
            "VolumeType": "gp2",
            "State": "in-use",
            "AttachedInstance": "i-0b987654321fedcba",
            "GP3Eligible": True,
            "MonthlySavingsUSD": 2.00,
        },
        {
            "VolumeId": "vol-0x1y2z3a4b5c6d7e8",
            "SizeGB": 50,
            "VolumeType": "gp2",
            "State": "available",
            "AttachedInstance": "Unattached",
            "GP3Eligible": True,
            "MonthlySavingsUSD": 1.00,
        },
    ],
    "ecs": [
        {
            "ClusterName": "cloudops-production-ecs-cluster",
            "Status": "ACTIVE",
            "RunningTasksCount": 4,
            "PendingTasksCount": 0,
            "ActiveServicesCount": 2,
            "RegisteredContainerInstancesCount": 2,
        }
    ],
    "deep_summary": {
        "total_rds_count": 2,
        "multi_az_rds_count": 1,
        "unattached_rds_snapshots": 1,
        "total_lambda_count": 3,
        "overprovisioned_lambda_count": 1,
        "total_ebs_count": 3,
        "gp2_migration_count": 3,
        "gp3_monthly_savings": 7.00,
        "unattached_ebs_count": 1,
        "total_ecs_clusters": 1,
        "total_ecs_running_tasks": 4,
    },
    "cloudwatch_metrics": {
        "instance_id": "i-0a123456789abcdef",
        "timestamps": ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
        "cpu": {"label": "CPU Utilization (%)", "values": [12.4, 11.2, 9.8, 14.5, 28.6, 42.1, 48.5, 52.3, 44.8, 38.2, 29.5, 18.2], "unit": "%"},
        "ram": {"label": "Memory Utilization (%)", "values": [32.1, 32.5, 31.8, 34.0, 48.2, 62.5, 68.4, 71.2, 65.0, 58.4, 45.2, 38.0], "unit": "%"},
        "net_in": {"label": "Network In (MB)", "values": [14.2, 12.8, 10.5, 18.2, 45.6, 92.4, 110.5, 128.4, 98.2, 75.4, 52.1, 28.4], "unit": "MB"},
        "net_out": {"label": "Network Out (MB)", "values": [28.4, 25.6, 21.0, 36.4, 91.2, 184.8, 221.0, 256.8, 196.4, 150.8, 104.2, 56.8], "unit": "MB"},
        "disk_io": {"label": "Disk Read/Write (MB/s)", "values": [4.2, 3.8, 3.1, 5.4, 14.2, 28.5, 35.2, 42.1, 31.4, 24.8, 16.2, 9.1], "unit": "MB/s"},
    },
    "recommendations": [
        {
            "id": "EBS-001",
            "severity": "MEDIUM",
            "category": "EBS Storage Optimization",
            "title": "Migrate Legacy EBS gp2 Volumes to gp3",
            "description": "3 legacy gp2 EBS volumes identified. Migrating to gp3 provides 20% lower cost per GB with baseline 3000 IOPS.",
            "action": "Convert volume type from gp2 to gp3 to save estimated ~$7.00/month instantly.",
        },
        {
            "id": "EBS-002",
            "severity": "HIGH",
            "category": "Cost Optimization",
            "title": "Orphaned Unattached EBS Volume Detected",
            "description": "1 unattached EBS volume currently in available state generating storage charges.",
            "action": "Delete unattached EBS volumes or create a snapshot backup before deletion.",
        },
        {
            "id": "SEC-001",
            "severity": "HIGH",
            "category": "Security Guardrails",
            "title": "CRITICAL: Publicly Exposed Management Port (SSH/RDP)",
            "description": "Security Group sg-0a8b1c2d3e4f5a6b7 allows unrestricted 0.0.0.0/0 inbound access on Port 22 (SSH).",
            "action": "Restrict inbound SSH access to trusted admin IP CIDRs or use AWS Systems Manager Session Manager.",
        },
        {
            "id": "SEC-002",
            "severity": "HIGH",
            "category": "Security Guardrails",
            "title": "Unprotected Database Port Exposure",
            "description": "Security Group sg-0f9e8d7c6b5a4f3e2 exposes database listener port MySQL 3306 to 0.0.0.0/0.",
            "action": "Restrict database ingress rules to internal application subnet CIDRs (e.g. 172.31.0.0/16).",
        },
        {
            "id": "S3-001",
            "severity": "HIGH",
            "category": "S3 Security",
            "title": "Unencrypted S3 Bucket Detected",
            "description": "Bucket cloudops-backups-archive has no default encryption configured.",
            "action": "Enable S3 Default Encryption (SSE-S3 or SSE-KMS) on all buckets.",
        },
        {
            "id": "REC-001",
            "severity": "HIGH",
            "category": "Cost Optimization",
            "title": "Idle Stopped EC2 Instance Detected",
            "description": "1 stopped EC2 instance (i-0b987654321fedcba) still accruing EBS storage charges.",
            "action": "Terminate idle stopped instances or detach unused EBS storage volumes.",
        },
    ],
    "ai_report": {
        "health_score": 71,
        "security_score": 65,
        "executive_summary": (
            "Your AWS environment has a Cloud Health Score of 71/100 with a security posture of 65/100 "
            "requiring immediate attention. Critical: Security Group sg-0a8b1c2d3e4f5a6b7 exposes SSH "
            "(Port 22) and Telnet (Port 23) to 0.0.0.0/0. Estimated savings of $12.40/month are "
            "achievable through EBS gp3 migration and idle EC2 cleanup."
        ),
        "priority_actions": [
            "Restrict SSH Port 22 to trusted admin IP CIDR — eliminate CRITICAL security exposure immediately",
            "Migrate 3 EBS gp2 volumes to gp3 — save $7.00/month (20% storage cost reduction)",
            "Terminate stopped EC2 instance i-0b987654321fedcba — save ~$5.40/month in EBS charges",
        ],
        "estimated_savings": "$12.40/month (54.2% reduction)",
        "terraform_remediation": (
            "```hcl\n"
            'provider "aws" {\n'
            '  region = "us-east-1"\n'
            "}\n\n"
            "# SEC-001: Restrict SSH to trusted admin CIDR\n"
            'resource "aws_security_group_rule" "restrict_ssh" {\n'
            '  type              = "ingress"\n'
            "  from_port         = 22\n"
            "  to_port           = 22\n"
            '  protocol          = "tcp"\n'
            '  cidr_blocks       = ["203.0.113.50/32"]  # Replace with your admin IP\n'
            '  security_group_id = "sg-0a8b1c2d3e4f5a6b7"\n'
            '  description       = "CloudOps AI: Restricted SSH"\n'
            "}\n"
            "```"
        ),
    },
    "is_demo": True,
    "aws_fetch_ms": 0,
}
