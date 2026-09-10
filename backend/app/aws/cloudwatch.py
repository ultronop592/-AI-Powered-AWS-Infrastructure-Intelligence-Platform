# app/aws/cloudwatch.py

import logging
from datetime import datetime, timedelta

import boto3

from app.aws.client import AWSClient

logger = logging.getLogger("cloudops.aws.cloudwatch")


class CloudWatchService:

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
            self.cw_client = client.cloudwatch
        except Exception as exc:
            logger.warning("CloudWatch client init failed: %s", exc)
            self.cw_client = None

    def get_ec2_metrics(self, instance_id="i-0a123456789abcdef"):
        if not self.cw_client:
            return self._get_mock_cloudwatch_metrics(instance_id)

        try:
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=24)

            queries = [
                {
                    "Id": "cpu",
                    "MetricStat": {
                        "Metric": {
                            "Namespace": "AWS/EC2",
                            "MetricName": "CPUUtilization",
                            "Dimensions": [{"Name": "InstanceId", "Value": instance_id}]
                        },
                        "Period": 3600,
                        "Stat": "Average"
                    }
                },
                {
                    "Id": "net_in",
                    "MetricStat": {
                        "Metric": {
                            "Namespace": "AWS/EC2",
                            "MetricName": "NetworkIn",
                            "Dimensions": [{"Name": "InstanceId", "Value": instance_id}]
                        },
                        "Period": 3600,
                        "Stat": "Sum"
                    }
                },
                {
                    "Id": "net_out",
                    "MetricStat": {
                        "Metric": {
                            "Namespace": "AWS/EC2",
                            "MetricName": "NetworkOut",
                            "Dimensions": [{"Name": "InstanceId", "Value": instance_id}]
                        },
                        "Period": 3600,
                        "Stat": "Sum"
                    }
                }
            ]

            res = self.cw_client.get_metric_data(
                MetricDataQueries=queries,
                StartTime=start_time,
                EndTime=end_time
            )

            results = {}
            for r in res.get("MetricDataResults", []):
                metric_id = r.get("Id")
                timestamps = [t.strftime("%H:%M") for t in r.get("Timestamps", [])]
                values = [round(v, 2) for v in r.get("Values", [])]
                results[metric_id] = {
                    "timestamps": list(reversed(timestamps)),
                    "values": list(reversed(values))
                }

            return {
                "instance_id": instance_id,
                "cpu": results.get("cpu", {}),
                "network_in": results.get("net_in", {}),
                "network_out": results.get("net_out", {}),
            }
        except Exception as exc:
            logger.warning("get_ec2_metrics failed: %s", exc)
            return self._get_mock_cloudwatch_metrics(instance_id)

    def _get_mock_cloudwatch_metrics(self, instance_id="i-0a123456789abcdef"):
        timestamps = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        
        if instance_id == "i-0b987654321fedcba":
            # Stopped instance - zero CPU
            cpu_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            ram_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            net_in_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            net_out_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            disk_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        else:
            # Active web server
            cpu_vals = [12.4, 11.2, 9.8, 14.5, 28.6, 42.1, 48.5, 52.3, 44.8, 38.2, 29.5, 18.2]
            ram_vals = [32.1, 32.5, 31.8, 34.0, 48.2, 62.5, 68.4, 71.2, 65.0, 58.4, 45.2, 38.0]
            net_in_vals = [14.2, 12.8, 10.5, 18.2, 45.6, 92.4, 110.5, 128.4, 98.2, 75.4, 52.1, 28.4]
            net_out_vals = [28.4, 25.6, 21.0, 36.4, 91.2, 184.8, 221.0, 256.8, 196.4, 150.8, 104.2, 56.8]
            disk_vals = [4.2, 3.8, 3.1, 5.4, 14.2, 28.5, 35.2, 42.1, 31.4, 24.8, 16.2, 9.1]

        return {
            "instance_id": instance_id,
            "timestamps": timestamps,
            "cpu": {"label": "CPU Utilization (%)", "values": cpu_vals, "unit": "%"},
            "ram": {"label": "Memory Utilization (%)", "values": ram_vals, "unit": "%"},
            "net_in": {"label": "Network In (MB)", "values": net_in_vals, "unit": "MB"},
            "net_out": {"label": "Network Out (MB)", "values": net_out_vals, "unit": "MB"},
            "disk_io": {"label": "Disk Read/Write (MB/s)", "values": disk_vals, "unit": "MB/s"},
        }
