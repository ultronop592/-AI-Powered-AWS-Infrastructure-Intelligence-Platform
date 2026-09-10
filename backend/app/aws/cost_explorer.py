# app/aws/cost_explorer.py

import logging
from datetime import date, timedelta

import boto3

from app.aws.client import AWSClient

logger = logging.getLogger("cloudops.aws.cost_explorer")


class CostExplorerService:

    def __init__(
        self,
        access_key: str = None,
        secret_key: str = None,
        region: str = None,
        boto3_session: boto3.Session = None,
    ):
        # Track whether we are using a live authenticated session.
        # When True, errors return $0.00 instead of mock $14.67.
        self._is_live = boto3_session is not None
        try:
            if boto3_session is not None:
                client = AWSClient.from_session(boto3_session)
            else:
                client = AWSClient(access_key, secret_key, region)
            self.client = client.cost_explorer
        except Exception as exc:
            logger.warning("CostExplorer client init failed: %s", exc)
            self.client = None

    def get_monthly_cost(self) -> dict:
        _fallback = {"monthly_cost": 0.0 if self._is_live else 14.67, "currency": "USD"}
        if not self.client:
            return _fallback

        today = date.today()
        start = today.replace(day=1)
        # Cost Explorer end date must be today or later
        end = min(today + timedelta(days=1), date(today.year, today.month + 1, 1)
                  if today.month < 12 else date(today.year + 1, 1, 1))

        try:
            response = self.client.get_cost_and_usage(
                TimePeriod={
                    "Start": start.strftime("%Y-%m-%d"),
                    "End": end.strftime("%Y-%m-%d"),
                },
                Granularity="MONTHLY",
                Metrics=["UnblendedCost"],
            )
            amount = (
                response["ResultsByTime"][0]["Total"]["UnblendedCost"]["Amount"]
            )
            return {"monthly_cost": round(float(amount), 2), "currency": "USD"}
        except Exception as exc:
            logger.warning("get_monthly_cost failed: %s", exc)
            return _fallback

    def get_cost_by_service(self) -> list:
        if not self.client:
            return []

        today = date.today()
        start = today.replace(day=1)
        end = min(today + timedelta(days=1), date(today.year, today.month + 1, 1)
                  if today.month < 12 else date(today.year + 1, 1, 1))

        try:
            response = self.client.get_cost_and_usage(
                TimePeriod={
                    "Start": start.strftime("%Y-%m-%d"),
                    "End": end.strftime("%Y-%m-%d"),
                },
                Granularity="MONTHLY",
                Metrics=["UnblendedCost"],
                GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
            )
            services = []
            for group in response.get("ResultsByTime", [{}])[0].get("Groups", []):
                cost = round(float(group["Metrics"]["UnblendedCost"]["Amount"]), 2)
                if cost > 0:
                    services.append({"service": group["Keys"][0], "cost": cost})
            return sorted(services, key=lambda x: x["cost"], reverse=True)
        except Exception as exc:
            logger.warning("get_cost_by_service failed: %s", exc)
            return []