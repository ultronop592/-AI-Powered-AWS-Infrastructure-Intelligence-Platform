# app/services/dashboard_service.py
"""
Dashboard orchestration service.

Key features added for production quality:
  - Parallel AWS API calls via ThreadPoolExecutor
  - Per-session TTL-based response cache (avoids hammering AWS APIs)
  - Cloud Health Score (composite metric)
  - Full Demo Mode support (is_demo=True returns rich mock data)
  - Structured logging throughout
"""

import json
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Optional

import boto3

from app.aws.cost_explorer import CostExplorerService
from app.aws.ec2 import EC2Service
from app.aws.s3 import S3Service
from app.aws.security import SecurityService
from app.aws.deep_services import DeepServicesService
from app.aws.cloudwatch import CloudWatchService
from app.services.analyzer import Analyzer
from app.services.compliance_service import ComplianceService
from app.ai.bedrock import BedrockService
from app.config import settings

logger = logging.getLogger("cloudops.services.dashboard")


# ---------------------------------------------------------------------------
# Response cache (per session_token / "demo")
# ---------------------------------------------------------------------------

class _ResponseCache:
    """Simple TTL cache keyed by an arbitrary string."""

    def __init__(self, ttl_seconds: int) -> None:
        self._cache: dict[str, tuple[dict, float]] = {}
        self._lock = threading.Lock()
        self._ttl = ttl_seconds

    def get(self, key: str) -> Optional[dict]:
        with self._lock:
            entry = self._cache.get(key)
            if entry and (time.monotonic() - entry[1]) < self._ttl:
                return entry[0]
            if entry:
                del self._cache[key]
        return None

    def set(self, key: str, value: dict) -> None:
        with self._lock:
            self._cache[key] = (value, time.monotonic())

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def invalidate_all(self, pattern: Optional[str] = None) -> None:
        with self._lock:
            if pattern:
                keys_to_del = [k for k in self._cache if pattern in k]
                for k in keys_to_del:
                    del self._cache[k]
            else:
                self._cache.clear()


_cache = _ResponseCache(ttl_seconds=settings.CACHE_TTL_SECONDS)


def invalidate_dashboard_cache(pattern: Optional[str] = None) -> None:
    """Invalidate cached dashboard responses globally or matching a pattern."""
    _cache.invalidate_all(pattern)



# ---------------------------------------------------------------------------
# Cloud Health Score
# ---------------------------------------------------------------------------

def compute_cloud_health_score(
    monthly_cost: float,
    security_score: int,
    stopped_ec2_count: int,
    gp2_volume_count: int,
    unencrypted_s3_count: int,
    unattached_ebs_count: int,
) -> int:
    """
    Composite 0-100 health score weighted across four pillars:
      - Cost Efficiency (30%)
      - Security Posture (40%)
      - Resource Utilization (20%)
      - Storage Hygiene (10%)
    """
    # Cost: penalise runaway spend but scale reasonably for SMB accounts
    cost_score = max(0, 100 - int(monthly_cost * 0.5))

    # Resource: penalise idle and improperly typed resources
    resource_score = max(0, 100 - stopped_ec2_count * 15 - gp2_volume_count * 5)

    # Storage hygiene
    storage_score = max(0, 100 - unencrypted_s3_count * 20 - unattached_ebs_count * 10)

    composite = (
        cost_score * 0.30
        + security_score * 0.40
        + resource_score * 0.20
        + storage_score * 0.10
    )
    return max(0, min(100, round(composite)))


# ---------------------------------------------------------------------------
# FinOps Resource Waste & Cost Efficiency Analysis (Feature 3.3)
# ---------------------------------------------------------------------------

def compute_service_waste_scores(
    cost_by_service: list,
    ec2: list,
    s3: list,
    ebs: list,
    lambdas: list,
    rds: list,
) -> list:
    """
    Computes FinOps waste and efficiency scores for each billed AWS service.
    Score: 0 - 100
      - > 70: Efficient (Green)
      - 30 - 70: Warning / Needs Optimization (Yellow)
      - < 30: Highly Wasteful (Red)
    """
    waste_items = []

    stopped_ec2 = [i for i in ec2 if (i.get("state") or i.get("State", "")).lower() == "stopped"]
    legacy_ec2 = [i for i in ec2 if (i.get("InstanceType") or "").startswith("t2.")]
    gp2_vols = [v for v in ebs if v.get("GP3Eligible") or v.get("VolumeType") == "gp2"]
    unattached_ebs = [v for v in ebs if v.get("AttachedInstance") in ["Unattached", "", None]]
    overprov_lambdas = [l for l in lambdas if l.get("MemorySize", 0) >= 1024 and l.get("MemoryEfficiencyPercent", 100) < 35]
    single_az_rds = [r for r in rds if not r.get("MultiAZ", False)]
    unversioned_s3 = [b for b in s3 if not b.get("Versioning", False)]

    # If EBS is not explicitly in cost_by_service, calculate an allocated cost slice
    services_found = {item.get("service", "") for item in cost_by_service}
    items_to_process = list(cost_by_service)
    if "Amazon Elastic Block Store" not in services_found and len(ebs) > 0:
        ebs_cost = sum(v.get("SizeGB", 50) * 0.10 for v in ebs)
        items_to_process.append({"service": "Amazon Elastic Block Store", "cost": round(ebs_cost, 2)})

    for item in items_to_process:
        service_name = item.get("service", "Other")
        cost = float(item.get("cost", 0.0))
        s_lower = service_name.lower()

        if "ec2" in s_lower and "elastic" not in s_lower:
            if len(stopped_ec2) > 0:
                eff = max(20, 100 - len(stopped_ec2) * 35 - len(legacy_ec2) * 15)
                savings = round(len(stopped_ec2) * 5.40, 2)
                finding = f"{len(stopped_ec2)} stopped EC2 instance(s) still incurring idle EBS storage charges."
            elif len(legacy_ec2) > 0:
                eff = 65
                savings = round(cost * 0.15, 2)
                finding = f"{len(legacy_ec2)} legacy t2 instance(s) detected. Upgrade to t3/t4g for better price-performance."
            else:
                eff = 90
                savings = 0.0
                finding = "All EC2 compute instances actively utilized with modern instance families."

        elif "elastic block store" in s_lower or "ebs" in s_lower:
            if len(unattached_ebs) > 0:
                eff = 25
                savings = round(sum(v.get("MonthlySavingsUSD", 2.30) for v in unattached_ebs) + len(gp2_vols) * 2.30, 2)
                finding = f"{len(unattached_ebs)} orphaned unattached volume(s) and {len(gp2_vols)} legacy gp2 volume(s) found."
            elif len(gp2_vols) > 0:
                eff = 45
                savings = round(sum(v.get("MonthlySavingsUSD", 2.30) for v in gp2_vols), 2)
                finding = f"{len(gp2_vols)} legacy gp2 volume(s) eligible for immediate 20% cost reduction on gp3."
            else:
                eff = 95
                savings = 0.0
                finding = "All storage volumes upgraded to cost-optimized gp3 specifications."

        elif "s3" in s_lower or "simple storage" in s_lower:
            if len(s3) > 3 or len(unversioned_s3) > 0:
                eff = 60
                savings = round(cost * 0.25, 2)
                finding = "No automated S3 Glacier lifecycle archival configured on non-current objects."
            else:
                eff = 85
                savings = 0.0
                finding = "S3 bucket storage tiering and encryption aligned with standard practices."

        elif "lambda" in s_lower:
            if len(overprov_lambdas) > 0:
                eff = 45
                savings = round(cost * 0.30, 2)
                finding = f"{len(overprov_lambdas)} function(s) allocated 1024MB+ with <35% average utilization."
            else:
                eff = 90
                savings = 0.0
                finding = "Lambda functions executing with right-sized memory and active runtimes."

        elif "rds" in s_lower or "relational database" in s_lower:
            if len(single_az_rds) > 0:
                eff = 65
                savings = 0.0
                finding = "Single-AZ database configuration — adequate for dev, consider Multi-AZ for production."
            else:
                eff = 88
                savings = 0.0
                finding = "RDS database instances operating with healthy connection pools."

        elif "key management" in s_lower or "kms" in s_lower:
            eff = 92
            savings = 0.0
            finding = "Customer Managed Keys (CMK) actively encrypting data without orphaned keys."

        elif "cloudwatch" in s_lower:
            eff = 85
            savings = round(cost * 0.15, 2) if cost > 5 else 0.0
            finding = "Log retention and metric collection operational within standard thresholds."

        elif "cloudtrail" in s_lower:
            eff = 95
            savings = 0.0
            finding = "Management event trail recording across regions without redundant duplication."

        else:
            eff = 80
            savings = 0.0
            finding = "Standard operational spend within regular billing baseline."

        waste_score = 100 - eff
        status = "Efficient" if eff >= 70 else ("Warning" if eff >= 30 else "Wasteful")

        waste_items.append({
            "service": service_name,
            "cost": cost,
            "efficiency_score": eff,
            "waste_score": waste_score,
            "status": status,
            "top_finding": finding,
            "potential_savings": savings,
        })

    return sorted(waste_items, key=lambda x: x["cost"], reverse=True)


# ---------------------------------------------------------------------------
# Dashboard Service
# ---------------------------------------------------------------------------

class DashboardService:

    def get_dashboard(
        self,
        boto3_session: Optional[boto3.Session] = None,
        region: Optional[str] = None,
        is_demo: bool = False,
        # Legacy keyword args — kept for backward compatibility
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
    ) -> dict:
        """
        Build and return the full dashboard payload.

        If is_demo=True (or no boto3_session provided), returns enriched
        mock data immediately without hitting any AWS APIs.
        """
        target_region = region or "us-east-1"

        # ---------------------------------------------------------------- #
        # Demo Mode
        # ---------------------------------------------------------------- #
        if is_demo or boto3_session is None:
            return self._demo_dashboard(target_region)

        # ---------------------------------------------------------------- #
        # Cache check (key = account_id:region approximated by session id)
        # ---------------------------------------------------------------- #
        cache_key = f"live:{id(boto3_session)}:{target_region}"
        cached = _cache.get(cache_key)
        if cached:
            logger.debug("Dashboard cache HIT for region=%s", target_region)
            cached["fetched_at"] = datetime.now(timezone.utc).isoformat()
            cached["cache_hit"] = True
            return cached

        logger.info("Dashboard cache MISS — fetching live AWS data for region=%s", target_region)
        start_t = time.monotonic()

        # ---------------------------------------------------------------- #
        # Parallel AWS API calls
        # ---------------------------------------------------------------- #
        cost_service = CostExplorerService(boto3_session=boto3_session)
        ec2_service = EC2Service(boto3_session=boto3_session)
        s3_service = S3Service(boto3_session=boto3_session)
        security_service = SecurityService(boto3_session=boto3_session)
        deep_services = DeepServicesService(boto3_session=boto3_session)
        cloudwatch_service = CloudWatchService(boto3_session=boto3_session)

        results: dict = {}

        def _fetch(name, fn, *args, **kwargs):
            try:
                return name, fn(*args, **kwargs)
            except Exception as exc:
                logger.warning("AWS fetch [%s] failed: %s", name, exc)
                return name, None

        tasks = {
            "cost":               (cost_service.get_monthly_cost,),
            "cost_by_service":    (cost_service.get_cost_by_service,),
            "ec2":                (ec2_service.list_instances,),
            "s3":                 (s3_service.list_buckets,),
            "security_groups":    (security_service.list_security_groups,),
            "rds":                (deep_services.list_rds_instances,),
            "lambdas":            (deep_services.list_lambda_functions,),
            "ebs":                (deep_services.list_ebs_volumes,),
            "ecs":                (deep_services.list_ecs_clusters,),
        }

        with ThreadPoolExecutor(max_workers=settings.MAX_WORKERS) as executor:
            futures = {
                executor.submit(_fetch, name, fn_args[0]): name
                for name, fn_args in tasks.items()
            }
            for future in as_completed(futures):
                name, value = future.result()
                results[name] = value

        elapsed = round(time.monotonic() - start_t, 3)
        logger.info("Parallel AWS fetch completed in %.3fs", elapsed)

        # ---------------------------------------------------------------- #
        # Unpack with safe defaults
        # ---------------------------------------------------------------- #
        cost = results.get("cost") or {"monthly_cost": 0.0, "currency": "USD"}
        cost_by_service = results.get("cost_by_service") or []
        ec2 = results.get("ec2") or []
        s3 = results.get("s3") or []
        security_groups = results.get("security_groups") or []
        rds = results.get("rds") or []
        lambdas = results.get("lambdas") or []
        ebs = results.get("ebs") or []
        ecs = results.get("ecs") or []

        # Derived security & S3 data
        security_summary = security_service.get_security_summary()
        s3_security = s3_service.get_s3_security_summary(s3)
        encryption_compliance = security_service.check_encryption_compliance(
            ebs_volumes=ebs, rds_instances=rds
        )
        deep_summary = deep_services.get_summary()

        # CloudWatch (best-effort: only query real instance IDs, never fake ones)
        try:
            first_ec2 = ec2[0]["InstanceId"] if ec2 else None
            cw_metrics = cloudwatch_service.get_ec2_metrics(first_ec2) if first_ec2 else {}
        except Exception:
            cw_metrics = {}

        # ---------------------------------------------------------------- #
        # Cloud Health Score
        # ---------------------------------------------------------------- #
        stopped_ec2 = [i for i in ec2 if (i.get("State") or "").lower() == "stopped"]
        security_score = security_summary.get("security_score", 75)
        health_score = compute_cloud_health_score(
            monthly_cost=cost.get("monthly_cost", 0.0),
            security_score=security_score,
            stopped_ec2_count=len(stopped_ec2),
            gp2_volume_count=deep_summary.get("gp2_migration_count", 0),
            unencrypted_s3_count=s3_security.get("unencrypted_bucket_count", 0),
            unattached_ebs_count=deep_summary.get("unattached_ebs_count", 0),
        )

        # ---------------------------------------------------------------- #
        # Recommendations (rule-based)
        # ---------------------------------------------------------------- #
        analyzer = Analyzer()
        recommendations = analyzer.analyze(
            ec2_instances=ec2,
            s3_buckets=s3,
            monthly_cost=cost.get("monthly_cost", 0.0),
            security_groups=security_groups,
            deep_services={"rds": rds, "lambdas": lambdas, "ebs": ebs, "ecs": ecs},
            s3_security=s3_security,
        )

        # ---------------------------------------------------------------- #
        # Build payload
        # ---------------------------------------------------------------- #
        dashboard_data = {
            "summary": {
                "monthly_cost": cost.get("monthly_cost", 0.0),
                "currency": cost.get("currency", "USD"),
                "ec2_count": len(ec2),
                "s3_bucket_count": len(s3),
                "security_health_score": security_score,
                "health_score": health_score,
                "rds_count": len(rds),
                "lambda_count": len(lambdas),
                "ebs_count": len(ebs),
                "gp3_monthly_savings": deep_summary.get("gp3_monthly_savings", 0.0),
            },
            "cost_by_service": cost_by_service,
            "ec2": ec2,
            "s3": s3,
            "security_groups": security_groups,
            "security_summary": security_summary,
            "s3_security": s3_security,
            "encryption_compliance": encryption_compliance,
            "rds": rds,
            "lambdas": lambdas,
            "ebs": ebs,
            "ecs": ecs,
            "deep_summary": deep_summary,
            "cloudwatch_metrics": cw_metrics,
            "recommendations": recommendations,
            "region": target_region,
            "is_demo": False,
            "is_mock": False,
            "account_id": getattr(getattr(boto3_session, '_session', None), 'get_config_variable', lambda x: '')("account_id") if boto3_session else None,
            "aws_fetch_ms": round(elapsed * 1000),
        }

        # ---------------------------------------------------------------- #
        # AI Report (structured JSON from Bedrock)
        # ---------------------------------------------------------------- #
        ai_service = BedrockService(boto3_session=boto3_session)
        ai_report = ai_service.generate_report(dashboard_data)
        dashboard_data["ai_report"] = ai_report

        # ---------------------------------------------------------------- #
        # Well-Architected Framework Compliance Scoring (Phase 3.1)
        # ---------------------------------------------------------------- #
        compliance_service = ComplianceService()
        dashboard_data["compliance"] = compliance_service.evaluate(dashboard_data)

        # ---------------------------------------------------------------- #
        # FinOps Resource Waste Analysis (Feature 3.3)
        # ---------------------------------------------------------------- #
        dashboard_data["waste_analysis"] = compute_service_waste_scores(
            cost_by_service, ec2, s3, ebs, lambdas, rds
        )

        # Cache result
        dashboard_data["fetched_at"] = datetime.now(timezone.utc).isoformat()
        dashboard_data["cache_hit"] = False
        _cache.set(cache_key, dashboard_data)

        return dashboard_data

    # ------------------------------------------------------------------ #
    # Demo Mode
    # ------------------------------------------------------------------ #

    def _demo_dashboard(self, region: str) -> dict:
        """
        Return a fully-structured demo payload with rich mock data.
        Matches the exact schema of the live response.
        """
        from app.lib.demo_data import DEMO_DASHBOARD_DATA
        data = dict(DEMO_DASHBOARD_DATA)
        data["region"] = region
        data["is_demo"] = True
        data["fetched_at"] = datetime.now(timezone.utc).isoformat()
        compliance_service = ComplianceService()
        data["compliance"] = compliance_service.evaluate(data)
        data["waste_analysis"] = compute_service_waste_scores(
            data.get("cost_by_service", []),
            data.get("ec2", []),
            data.get("s3", []),
            data.get("ebs", []),
            data.get("lambdas", []),
            data.get("rds", []),
        )
        return data
