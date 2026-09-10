# app/aws/ec2.py

import logging
import boto3
from app.aws.client import AWSClient

logger = logging.getLogger("cloudops.aws.ec2")


class EC2Service:

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
            self.client = client.ec2
        except Exception as exc:
            logger.warning("EC2 client init failed: %s", exc)
            self.client = None

    def list_instances(self):
        if not self.client:
            return []

        try:
            response = self.client.describe_instances()
            instances = []

            for reservation in response.get("Reservations", []):
                for instance in reservation.get("Instances", []):
                    instances.append({
                        "InstanceId": instance.get("InstanceId"),
                        "InstanceType": instance.get("InstanceType"),
                        "State": instance.get("State", {}).get("Name", "unknown"),
                        "PublicIp": instance.get("PublicIpAddress", "N/A"),
                        "PrivateIp": instance.get("PrivateIpAddress", "N/A"),
                        "Region": instance.get("Placement", {}).get("AvailabilityZone", "us-east-1"),
                        "LaunchTime": str(instance.get("LaunchTime", "")),
                    })

            return instances
        except Exception as exc:
            logger.warning("EC2 list_instances failed: %s", exc)
            return []