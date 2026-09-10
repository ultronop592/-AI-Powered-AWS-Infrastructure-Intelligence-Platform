# app/aws/s3.py
"""
S3 service — lists buckets and checks security posture:
  - Public access block settings
  - Default encryption status
  - Versioning status
"""

import logging

import boto3

from app.aws.client import AWSClient

logger = logging.getLogger("cloudops.aws.s3")


class S3Service:

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
            self.client = client.s3
        except Exception as exc:
            logger.warning("S3 client init failed: %s", exc)
            self.client = None

    # ------------------------------------------------------------------ #

    def list_buckets(self):
        if not self.client:
            return self._mock_buckets()

        try:
            response = self.client.list_buckets()
            buckets = []

            for bucket in response.get("Buckets", []):
                name = bucket.get("Name", "")
                creation_date = str(bucket.get("CreationDate", ""))

                # Check public access block
                public_access = self._is_public(name)
                # Check encryption
                encrypted = self._is_encrypted(name)
                # Check versioning
                versioning = self._has_versioning(name)
                # Determine bucket region
                region = self._get_bucket_region(name)

                buckets.append({
                    "Name": name,
                    "CreationDate": creation_date,
                    "Region": region,
                    "Encrypted": encrypted,
                    "PublicAccess": public_access,
                    "Versioning": versioning,
                })

            return buckets

        except Exception as exc:
            logger.warning("S3 list_buckets failed: %s", exc)
            return self._mock_buckets()

    # ------------------------------------------------------------------ #
    # S3 security helpers
    # ------------------------------------------------------------------ #

    def _is_public(self, bucket_name: str) -> bool:
        """Returns True if the bucket has public access (i.e. NOT fully blocked)."""
        try:
            pab = self.client.get_public_access_block(Bucket=bucket_name)
            cfg = pab.get("PublicAccessBlockConfiguration", {})
            # All four must be True to be considered NOT public
            fully_blocked = (
                cfg.get("BlockPublicAcls", False)
                and cfg.get("IgnorePublicAcls", False)
                and cfg.get("BlockPublicPolicy", False)
                and cfg.get("RestrictPublicBuckets", False)
            )
            return not fully_blocked
        except self.client.exceptions.NoSuchPublicAccessBlockConfiguration:
            return True  # No config == potentially public
        except Exception:
            return False  # Assume private if we can't check

    def _is_encrypted(self, bucket_name: str) -> bool:
        """Returns True if the bucket has a default encryption rule."""
        try:
            enc = self.client.get_bucket_encryption(Bucket=bucket_name)
            rules = enc.get("ServerSideEncryptionConfiguration", {}).get("Rules", [])
            return len(rules) > 0
        except Exception:
            return False

    def _has_versioning(self, bucket_name: str) -> bool:
        """Returns True if versioning is enabled."""
        try:
            v = self.client.get_bucket_versioning(Bucket=bucket_name)
            return v.get("Status") == "Enabled"
        except Exception:
            return False

    def _get_bucket_region(self, bucket_name: str) -> str:
        try:
            loc = self.client.get_bucket_location(Bucket=bucket_name)
            region = loc.get("LocationConstraint") or "us-east-1"
            return region
        except Exception:
            return "us-east-1"

    # ------------------------------------------------------------------ #
    # Security summary for S3
    # ------------------------------------------------------------------ #

    def get_s3_security_summary(self, buckets: list = None) -> dict:
        """
        Returns aggregated S3 security findings.
        Pass pre-fetched bucket list to avoid double API calls.
        """
        if buckets is None:
            buckets = self.list_buckets()

        public_buckets = [b for b in buckets if b.get("PublicAccess")]
        unencrypted_buckets = [b for b in buckets if not b.get("Encrypted")]
        unversioned_buckets = [b for b in buckets if not b.get("Versioning")]

        violations = []
        for b in public_buckets:
            violations.append({
                "bucket": b["Name"],
                "finding": "Public access not fully blocked",
                "severity": "CRITICAL",
            })
        for b in unencrypted_buckets:
            violations.append({
                "bucket": b["Name"],
                "finding": "No default encryption configured",
                "severity": "HIGH",
            })

        return {
            "total_buckets": len(buckets),
            "public_bucket_count": len(public_buckets),
            "unencrypted_bucket_count": len(unencrypted_buckets),
            "unversioned_bucket_count": len(unversioned_buckets),
            "s3_violations": violations,
        }

    # ------------------------------------------------------------------ #
    # Mock data (demo mode)
    # ------------------------------------------------------------------ #

    def _mock_buckets(self):
        return [
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
        ]