# =============================================================================
# CloudOps AI — Root Dockerfile (backend, build context = repo root)
# Delegates to the backend Dockerfile so docker-compose works without changes.
# For ECS, build from backend/ directly.
# =============================================================================

# ---- Stage 1: dependency installer ----------------------------------------
FROM python:3.12-slim AS deps

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r /tmp/requirements.txt

# ---- Stage 2: production runtime -------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    AWS_DEFAULT_REGION=ap-south-1

RUN groupadd --gid 1001 appgroup \
    && useradd  --uid 1001 --gid 1001 --no-create-home --shell /bin/false appuser

WORKDIR /app

COPY --from=deps /install /usr/local

COPY backend/requirements.txt .
COPY backend/main.py .
COPY backend/app/ ./app/

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", \
    "--host", "0.0.0.0", \
    "--port", "8000", \
    "--workers", "1", \
    "--proxy-headers", \
    "--forwarded-allow-ips", "*", \
    "--log-level", "info"]
