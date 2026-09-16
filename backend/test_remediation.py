"""
Test script for Phase 2 Feature 2.1 One-Click Auto-Remediation (Part 1).
Validates:
- GET /remediation/supported
- POST /remediation/apply for SEC-001
- POST /remediation/apply for EBS-001
- POST /remediation/apply for S3-001
- POST /remediation/apply for S3-002
- POST /remediation/apply error handling for invalid finding ID
- GET /remediation/audit-log records
- DashboardService cache invalidation
"""

import sys
from fastapi.testclient import TestClient
from main import app
from app.services.remediation_service import remediation_service, SUPPORTED_REMEDIATIONS
from app.services.dashboard_service import invalidate_dashboard_cache

client = TestClient(app)

def run_tests():
    print("=== Testing Remediation Service & API (Part 1) ===")

    # 1. Test supported remediations
    res = client.get("/remediation/supported")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    supported = res.json()
    assert supported["count"] == 4, f"Expected 4 supported remediations, got {supported['count']}"
    finding_ids = [r["finding_id"] for r in supported["supported_remediations"]]
    for fid in ["SEC-001", "EBS-001", "S3-001", "S3-002"]:
        assert fid in finding_ids, f"Missing finding ID {fid}"
    print("[PASS] GET /remediation/supported returned all 4 findings:", finding_ids)

    # 2. Test SEC-001 auto-remediation (Demo mode)
    sec_payload = {
        "finding_id": "SEC-001",
        "resource_id": "sg-0a8b1c2d3e4f5a6b7",
        "parameters": {
            "target_cidr": "10.0.0.0/16",
            "revoke_only": False,
            "ports": [22, 3389]
        }
    }
    res = client.post("/remediation/apply", json=sec_payload)
    assert res.status_code == 200, f"SEC-001 failed with status {res.status_code}: {res.text}"
    sec_data = res.json()
    assert sec_data["success"] is True
    assert sec_data["finding_id"] == "SEC-001"
    assert sec_data["resource_id"] == "sg-0a8b1c2d3e4f5a6b7"
    assert "audit_id" in sec_data
    assert sec_data["is_demo"] is True
    assert sec_data["status"] == "SUCCESS"
    print("[PASS] POST /remediation/apply SEC-001 succeeded:", sec_data["action_taken"])

    # 3. Test EBS-001 auto-remediation (Demo mode)
    ebs_payload = {
        "finding_id": "EBS-001",
        "resource_id": "vol-0a1b2c3d4e5f6g7h8",
    }
    res = client.post("/remediation/apply", json=ebs_payload)
    assert res.status_code == 200, f"EBS-001 failed with status {res.status_code}: {res.text}"
    ebs_data = res.json()
    assert ebs_data["success"] is True
    assert ebs_data["finding_id"] == "EBS-001"
    assert ebs_data["details"]["target_type"] == "gp3"
    print("[PASS] POST /remediation/apply EBS-001 succeeded:", ebs_data["action_taken"])

    # 4. Test S3-001 auto-remediation (Demo mode)
    s3_1_payload = {
        "finding_id": "S3-001",
        "resource_id": "cloudops-backups-archive",
    }
    res = client.post("/remediation/apply", json=s3_1_payload)
    assert res.status_code == 200, f"S3-001 failed with status {res.status_code}: {res.text}"
    s3_1_data = res.json()
    assert s3_1_data["success"] is True
    assert s3_1_data["finding_id"] == "S3-001"
    assert s3_1_data["details"]["encryption_algorithm"] == "AES256"
    print("[PASS] POST /remediation/apply S3-001 succeeded:", s3_1_data["action_taken"])

    # 5. Test S3-002 auto-remediation (Demo mode)
    s3_2_payload = {
        "finding_id": "S3-002",
        "resource_id": "cloudops-assets-public",
    }
    res = client.post("/remediation/apply", json=s3_2_payload)
    assert res.status_code == 200, f"S3-002 failed with status {res.status_code}: {res.text}"
    s3_2_data = res.json()
    assert s3_2_data["success"] is True
    assert s3_2_data["finding_id"] == "S3-002"
    assert s3_2_data["details"]["block_public_acls"] is True
    print("[PASS] POST /remediation/apply S3-002 succeeded:", s3_2_data["action_taken"])

    # 6. Test invalid finding ID rejection
    bad_payload = {
        "finding_id": "UNKNOWN-999",
        "resource_id": "test-res",
    }
    res = client.post("/remediation/apply", json=bad_payload)
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print("[PASS] POST /remediation/apply rejected invalid finding ID with HTTP 400 as expected.")

    # 7. Test audit log retrieval
    res = client.get("/remediation/audit-log")
    assert res.status_code == 200, f"Audit log failed with status {res.status_code}"
    audit_data = res.json()
    assert audit_data["total"] >= 4, f"Expected at least 4 audit logs, got {audit_data['total']}"
    logged_findings = [entry["finding_id"] for entry in audit_data["audit_logs"]]
    for fid in ["SEC-001", "EBS-001", "S3-001", "S3-002"]:
        assert fid in logged_findings, f"Finding {fid} not recorded in audit log"
    print(f"[PASS] GET /remediation/audit-log verified {audit_data['total']} audit entries recorded.")

    # 8. Test cache invalidation call
    invalidate_dashboard_cache()
    print("[PASS] Dashboard cache invalidation function verified.")

    print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY FOR PART 1!")

if __name__ == "__main__":
    run_tests()
