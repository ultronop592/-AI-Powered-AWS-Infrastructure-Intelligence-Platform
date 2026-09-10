# app/aws/client.py
"""
AWS client factory.

Supports two construction modes:
  1. AWSClient(access_key, secret_key, region)  — builds a fresh session
  2. AWSClient.from_session(boto3_session)       — wraps an existing session
     (used by the session-based auth flow so credentials are never re-sent)
"""

import boto3
from app.config import settings


class AWSClient:

    def __init__(
        self,
        access_key: str = None,
        secret_key: str = None,
        region: str = None,
    ):
        region_name = region or settings.AWS_REGION

        if access_key and secret_key:
            self.session = boto3.Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region_name,
            )
        else:
            self.session = boto3.Session(region_name=region_name)

        self._region = region_name

    @classmethod
    def from_session(cls, boto3_session: boto3.Session) -> "AWSClient":
        """Wrap an already-validated boto3 Session (no credentials needed)."""
        instance = cls.__new__(cls)
        instance.session = boto3_session
        instance._region = boto3_session.region_name or settings.AWS_REGION
        return instance

    # ------------------------------------------------------------------ #
    # Service client properties                                            #
    # ------------------------------------------------------------------ #

    @property
    def sts(self):
        return self.session.client("sts")

    @property
    def cost_explorer(self):
        # Cost Explorer is only available in us-east-1
        return self.session.client("ce", region_name="us-east-1")

    @property
    def ec2(self):
        return self.session.client("ec2", region_name=self._region)

    @property
    def s3(self):
        return self.session.client("s3")

    @property
    def bedrock(self):
        return self.session.client("bedrock-runtime", region_name=self._region)

    @property
    def iam(self):
        return self.session.client("iam")

    @property
    def rds(self):
        return self.session.client("rds", region_name=self._region)

    @property
    def lambda_client(self):
        return self.session.client("lambda", region_name=self._region)

    @property
    def ecs(self):
        return self.session.client("ecs", region_name=self._region)

    @property
    def cloudwatch(self):
        return self.session.client("cloudwatch", region_name=self._region)