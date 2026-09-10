# app/sessions/session_store.py
"""
Thread-safe in-memory session store.

Stores validated boto3 sessions keyed by a UUID token so that raw
AWS credentials never need to be sent on every HTTP request after
the initial STS-verified connect.
"""

import uuid
import logging
import threading
from datetime import datetime, timedelta
from typing import Optional

import boto3

from app.config import settings

logger = logging.getLogger("cloudops.sessions")


class _Session:
    """Wraps a boto3.Session with expiry metadata."""

    def __init__(
        self,
        boto3_session: boto3.Session,
        account_id: str,
        arn: str,
        region: str,
    ) -> None:
        self.boto3_session = boto3_session
        self.account_id = account_id
        self.arn = arn
        self.region = region
        self.created_at: datetime = datetime.utcnow()
        self.expires_at: datetime = self.created_at + timedelta(
            seconds=settings.SESSION_TTL_SECONDS
        )
        self.last_used: datetime = self.created_at

    def is_expired(self) -> bool:
        return datetime.utcnow() >= self.expires_at

    def refresh_last_used(self) -> None:
        self.last_used = datetime.utcnow()

    def to_info(self) -> dict:
        return {
            "account_id": self.account_id,
            "arn": self.arn,
            "region": self.region,
            "created_at": self.created_at.isoformat() + "Z",
            "expires_at": self.expires_at.isoformat() + "Z",
        }


class SessionStore:
    """
    Thread-safe, TTL-aware in-memory session registry.

    Usage
    -----
    token = session_store.create(boto3_session, account_id, arn, region)
    sess  = session_store.get(token)   # returns None if expired / missing
    session_store.delete(token)
    """

    def __init__(self) -> None:
        self._store: dict[str, _Session] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def create(
        self,
        boto3_session: boto3.Session,
        account_id: str,
        arn: str,
        region: str,
    ) -> str:
        token = str(uuid.uuid4())
        entry = _Session(boto3_session, account_id, arn, region)
        with self._lock:
            self._store[token] = entry
        logger.info("Session created for account=%s region=%s", account_id, region)
        return token

    def get(self, token: str) -> Optional[_Session]:
        with self._lock:
            entry = self._store.get(token)
            if entry is None:
                return None
            if entry.is_expired():
                del self._store[token]
                logger.info("Session expired and removed: account=%s", entry.account_id)
                return None
            entry.refresh_last_used()
            return entry

    def delete(self, token: str) -> bool:
        with self._lock:
            if token in self._store:
                account_id = self._store[token].account_id
                del self._store[token]
                logger.info("Session deleted for account=%s", account_id)
                return True
            return False

    def cleanup_expired(self) -> int:
        """Remove all expired sessions. Returns count removed."""
        now = datetime.utcnow()
        with self._lock:
            expired = [k for k, v in self._store.items() if now >= v.expires_at]
            for k in expired:
                del self._store[k]
        if expired:
            logger.info("Session cleanup removed %d expired session(s)", len(expired))
        return len(expired)

    def count(self) -> int:
        with self._lock:
            return len(self._store)


# Module-level singleton — imported everywhere
session_store = SessionStore()
