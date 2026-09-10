# =============================================================================
# CloudOps AI — FastAPI Backend
# Production Dockerfile for Amazon ECS Fargate
# =============================================================================
#
# Build strategy:
#   Stage 1 (deps)   — install Python dependencies into an isolated prefix.
#                       This layer is only rebuilt when requirements.txt changes.
#   Stage 2 (runtime)— copy the installed packages + app code into a minimal
#                       final image.  No build tools, no pip, no cache files.
#
# Build & push to ECR:
#   docker build -t cloudops-ai-backend .
#   docker tag  cloudops-ai-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/cloudops-ai-backend:latest
#   docker push <account>.dkr.ecr.<region>.amazonaws.com/cloudops-ai-backend:latest
# =============================================================================

# ---- Stage 1: dependency installer ----------------------------------------
FROM python:3.12-slim AS deps

# Install OS-level build deps needed by some Python wheels (e.g. cryptography),
# then clean up apt lists in the same layer to keep size down.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies into /install so we can copy them cleanly to the final
# stage without dragging along pip, setuptools, or the wheel cache.
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r /tmp/requirements.txt

# ---- Stage 2: production runtime -------------------------------------------
FROM python:3.12-slim AS runtime

# ---------- Environment ----------
# Prevent .pyc files and enable log streaming (required for CloudWatch Logs).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    # Tell boto3/botocore where to find credentials (ECS task role via IMDS).
    AWS_DEFAULT_REGION=us-east-1

# ---------- Non-root user (ECS security best practice) ----------
RUN groupadd --gid 1001 appgroup \
    && useradd  --uid 1001 --gid 1001 --no-create-home --shell /bin/false appuser

# ---------- Working directory ----------
WORKDIR /app

# ---------- Copy installed packages from deps stage ----------
COPY --from=deps /install /usr/local

# ---------- Copy application source ----------
# requirements.txt first (already installed — just for reference/auditing)
COPY requirements.txt .
# Main entrypoint and the app package
COPY main.py .
COPY app/ ./app/

# ---------- Security: drop to non-root ----------
USER appuser

# ---------- Network ----------
EXPOSE 8000

# ---------- ECS Health Check ----------
# ECS uses this to decide whether the task is healthy before routing traffic.
# /  returns {"status":"running"} — lightweight, no AWS calls.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# ---------- Entrypoint ----------
# --workers 1  keeps memory predictable per Fargate task; scale via ECS desired count.
# --proxy-headers / --forwarded-allow-ips handle the ALB → Fargate X-Forwarded-* chain.
CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--proxy-headers", \
     "--forwarded-allow-ips", "*", \
     "--log-level", "info"]
