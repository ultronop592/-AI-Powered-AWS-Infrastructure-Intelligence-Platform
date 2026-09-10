# app/ai/bedrock.py
"""
Amazon Bedrock AI service.

generate_report() — returns a *structured dict* (not plain text) so the
frontend can render each field independently.

chat_copilot() — drives the AI Copilot drawer with intelligent DevOps
responses from Bedrock or a rich rule-based fallback engine.
"""

import json
import logging
import re

import boto3

from app.aws.client import AWSClient
from app.config import settings
from app.ai.prompts import STRUCTURED_REPORT_PROMPT, REPORT_PROMPT_TEMPLATE

logger = logging.getLogger("cloudops.ai.bedrock")


# ---------------------------------------------------------------------------
# Structured AI report schema (fallback / demo mode)
# ---------------------------------------------------------------------------

def _build_fallback_report(dashboard_data: dict, security_score: int) -> dict:
    """
    Rule-based structured report used when Bedrock is unavailable.
    Returns the same schema the LLM is asked to produce.
    """
    summary = dashboard_data.get("summary", {})
    monthly_cost = summary.get("monthly_cost", 14.67)
    gp3_savings = summary.get("gp3_monthly_savings", 7.00)
    ec2 = dashboard_data.get("ec2", [])
    stopped_ec2 = [i for i in ec2 if (i.get("state") or i.get("State", "")).lower() == "stopped"]
    ec2_savings = len(stopped_ec2) * 5.40
    total_savings = round(gp3_savings + ec2_savings, 2)
    savings_pct = round((total_savings / monthly_cost) * 100, 1) if monthly_cost else 0

    sec_summary = dashboard_data.get("security_summary", {})
    critical_sgs = sec_summary.get("critical_risk_count", 0)
    region = dashboard_data.get("region", "us-east-1")

    # Health score composite
    cost_score = max(0, 100 - int((monthly_cost / 200) * 100))
    resource_score = max(0, 100 - len(stopped_ec2) * 20)
    health_score = int((cost_score * 0.3 + security_score * 0.4 + resource_score * 0.3))

    priority_actions = []
    recs = dashboard_data.get("recommendations", [])
    for r in recs[:3]:
        priority_actions.append(r.get("action", r.get("title", "")))
    while len(priority_actions) < 3:
        priority_actions.append("Review AWS Cost Explorer for additional optimization opportunities.")

    # Terraform for the top security issue
    sg_id = "sg-0a8b1c2d3e4f5a6b7"
    open_ports = sec_summary.get("open_critical_ports", [])
    if open_ports:
        sg_id = open_ports[0].get("group_id", sg_id)

    terraform = f"""\
```hcl
provider "aws" {{
  region = "{region}"
}}

# SEC-001: Restrict SSH (Port 22) to trusted admin CIDR
resource "aws_security_group_rule" "restrict_ssh" {{
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["203.0.113.50/32"]  # Replace with your trusted IP
  security_group_id = "{sg_id}"
  description       = "CloudOps AI: Restricted SSH access"
}}

# Zero-trust alternative: AWS SSM Session Manager (no open inbound ports)
resource "aws_iam_role_policy_attachment" "ssm_managed_core" {{
  role       = "CloudOpsEC2Role"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}}
```"""

    exec_summary = (
        f"Your AWS environment in {region} has a Cloud Health Score of {health_score}/100 "
        f"with a security posture of {security_score}/100. "
        f"Immediate action is required on {critical_sgs} critical security group(s) with publicly exposed management ports. "
        f"Estimated monthly savings of ${total_savings:.2f} are achievable through EBS gp3 migration and idle EC2 cleanup."
    )

    return {
        "health_score": max(0, min(100, health_score)),
        "security_score": security_score,
        "executive_summary": exec_summary,
        "priority_actions": priority_actions,
        "estimated_savings": f"${total_savings:.2f}/month ({savings_pct}% reduction)",
        "terraform_remediation": terraform,
    }


# ---------------------------------------------------------------------------
# Bedrock Service
# ---------------------------------------------------------------------------

class BedrockService:

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
            self.client = client.bedrock
        except Exception as exc:
            logger.warning("Bedrock client init failed: %s", exc)
            self.client = None

    # ------------------------------------------------------------------ #
    # Internal: invoke model and extract text
    # ------------------------------------------------------------------ #

    def _invoke(self, prompt: str, max_tokens: int = 2048) -> str | None:
        """Invoke the configured Bedrock model and return raw text output."""
        if not self.client:
            return None

        model_id = settings.BEDROCK_MODEL_ID
        try:
            if "nova" in model_id:
                body = json.dumps({
                    "messages": [
                        {"role": "user", "content": [{"text": prompt}]}
                    ],
                    "inferenceConfig": {"maxTokens": max_tokens, "temperature": 0.3},
                })
            elif "anthropic" in model_id:
                body = json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": prompt}],
                })
            else:
                body = json.dumps({
                    "inputText": prompt,
                    "textGenerationConfig": {"maxTokenCount": max_tokens, "temperature": 0.3},
                })

            response = self.client.invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=body,
            )
            response_body = json.loads(response["body"].read().decode("utf-8"))

            if "nova" in model_id:
                return (
                    response_body.get("output", {})
                    .get("message", {})
                    .get("content", [{}])[0]
                    .get("text", "")
                )
            elif "anthropic" in model_id:
                return response_body.get("content", [{}])[0].get("text", "")
            elif "results" in response_body:
                return response_body["results"][0].get("outputText", "")
            return str(response_body)

        except Exception as exc:
            logger.warning("Bedrock invoke failed (%s): %s", model_id, exc)
            return None

    # ------------------------------------------------------------------ #
    # Structured report generation
    # ------------------------------------------------------------------ #

    def generate_report(self, dashboard_data: dict) -> dict:
        """
        Returns a structured dict:
          {
            health_score, security_score, executive_summary,
            priority_actions, estimated_savings, terraform_remediation
          }
        Falls back to a rule-based report if Bedrock is unavailable or
        returns malformed JSON.
        """
        summary = dashboard_data.get("summary", {})
        security_summary = dashboard_data.get("security_summary", {})
        security_score = security_summary.get("security_score", 75)
        s3_violations = dashboard_data.get("s3_security", {}).get("s3_violations", [])
        open_critical_ports = security_summary.get("open_critical_ports", [])

        fallback = _build_fallback_report(dashboard_data, security_score)

        if not self.client:
            logger.info("Bedrock unavailable — using rule-based report")
            return fallback

        prompt = STRUCTURED_REPORT_PROMPT.format(
            monthly_cost=summary.get("monthly_cost", 0.0),
            currency=summary.get("currency", "USD"),
            ec2_count=summary.get("ec2_count", 0),
            s3_bucket_count=summary.get("s3_bucket_count", 0),
            security_score=security_score,
            critical_sg_count=security_summary.get("critical_risk_count", 0),
            open_ports_count=security_summary.get("total_open_ports", 0),
            gp2_count=dashboard_data.get("deep_summary", {}).get("gp2_migration_count", 0),
            lambda_count=summary.get("lambda_count", 0),
            rds_count=summary.get("rds_count", 0),
            cost_by_service=json.dumps(dashboard_data.get("cost_by_service", []), indent=2),
            recommendations=json.dumps(dashboard_data.get("recommendations", []), indent=2),
            s3_violations=json.dumps(s3_violations, indent=2),
            open_critical_ports=json.dumps(open_critical_ports, indent=2),
        )

        raw = self._invoke(prompt, max_tokens=2048)
        if not raw:
            return fallback

        # Parse JSON from response (model may wrap in markdown fences)
        parsed = self._extract_json(raw)
        if parsed:
            # Merge: fill any missing keys from fallback
            for key, value in fallback.items():
                if key not in parsed or not parsed[key]:
                    parsed[key] = value
            logger.info("Bedrock structured report generated successfully")
            return parsed

        logger.warning("Bedrock response was not valid JSON — using fallback report")
        return fallback

    def _extract_json(self, text: str) -> dict | None:
        """Extract a JSON object from LLM output that may contain markdown fences."""
        # Try direct parse first
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass

        # Strip markdown code fences
        stripped = re.sub(r"```(?:json)?\s*|\s*```", "", text, flags=re.IGNORECASE).strip()
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

        # Try to find {...} substring
        match = re.search(r"\{[\s\S]+\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        return None

    # ------------------------------------------------------------------ #
    # Copilot chat
    # ------------------------------------------------------------------ #

    def chat_copilot(self, message: str, context: dict, mode: str = "chat") -> tuple[str, str]:
        """
        Returns (reply_text, engine_source) where engine_source is
        'bedrock' or 'fallback'.
        """
        msg_lower = message.lower()
        target_region = context.get("region", "us-east-1") if isinstance(context, dict) else "us-east-1"

        # Attempt live Bedrock call
        if self.client:
            system_prompt = (
                f"You are AWS CloudOps Copilot, an expert DevOps engineer. "
                f"Infrastructure context: {json.dumps(context)}. "
                f"If mode is terraform, respond with production-ready HCL code blocks in ```hcl ... ``` fences."
            )
            raw = self._invoke(f"{system_prompt}\n\nUser: {message}", max_tokens=1500)
            if raw:
                return f"🤖 **[Generated Live by Amazon Bedrock]**\n\n{raw}", "bedrock"

        # ---------------------------------------------------------------- #
        # Rich rule-based fallback copilot engine
        # ---------------------------------------------------------------- #
        is_terraform = mode == "terraform" or any(
            kw in msg_lower for kw in ["terraform", "hcl", "sec-001", "ebs-001"]
        )

        if is_terraform:
            if any(kw in msg_lower for kw in ["port 22", "ssh", "sec-001", "security group", "rdp", "3389"]):
                return f"""⚡ **[CloudOps AI Engine]**

Here is the **Terraform (HCL)** code to fix **SEC-001** (restricting open SSH Port 22 from `0.0.0.0/0`):

```hcl
provider "aws" {{
  region = "{target_region}"
}}

# SEC-001: Restrict SSH to trusted admin CIDR
resource "aws_security_group_rule" "restrict_ssh_admin" {{
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["203.0.113.50/32"]  # Replace with your trusted admin IP
  security_group_id = "sg-0a8b1c2d3e4f5a6b7"
  description       = "CloudOps AI: Restricted SSH for admin access only"
}}

# Zero-trust alternative: SSM Session Manager (no open SSH ports)
resource "aws_iam_role_policy_attachment" "ssm_core" {{
  role       = "CloudOpsEC2Role"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}}
```

### Apply Steps:
1. Save as `security.tf` in your Terraform workspace.
2. Run `terraform plan` to preview changes in `{target_region}`.
3. Run `terraform apply` to enforce restricted SSH access.""", "fallback"

            elif any(kw in msg_lower for kw in ["alb", "load balancer"]):
                return f"""⚡ **[CloudOps AI Engine]**

Here is the **Terraform (HCL)** code for an **AWS Application Load Balancer (ALB)** in `{target_region}`:

```hcl
provider "aws" {{
  region = "{target_region}"
}}

resource "aws_lb" "app_alb" {{
  name               = "cloudops-web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = ["sg-0a8b1c2d3e4f5a6b7"]
  subnets            = ["subnet-01234567", "subnet-89abcdef"]
  enable_deletion_protection = true
  tags = {{ Environment = "production", ManagedBy = "CloudOps-AI" }}
}}

resource "aws_lb_target_group" "alb_targets" {{
  name     = "cloudops-alb-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = "vpc-0123456789abcdef0"
  health_check {{ path = "/health" interval = 30 }}
}}
```""", "fallback"

            elif any(kw in msg_lower for kw in ["gp3", "ebs", "ebs-001", "volume"]):
                return f"""⚡ **[CloudOps AI Engine]**

Here is the **Terraform (HCL)** to fix **EBS-001** (converting `gp2` → `gp3`, saves ~20% cost):

```hcl
provider "aws" {{
  region = "{target_region}"
}}

# Convert EBS gp2 → gp3 (EBS-001)
resource "aws_ebs_volume" "cloudops_app_storage" {{
  availability_zone = "{target_region}a"
  size              = 200
  type              = "gp3"   # Was: gp2
  iops              = 3000    # Baseline IOPS included free
  throughput        = 125     # MB/s baseline included free
  encrypted         = true    # Best practice: always encrypt
  tags = {{ Name = "cloudops-app-vol", ManagedBy = "CloudOps-AI" }}
}}
```""", "fallback"

            elif any(kw in msg_lower for kw in ["s3", "bucket", "lifecycle", "glacier"]):
                return f"""⚡ **[CloudOps AI Engine]**

Here is the **Terraform (HCL)** to add an **S3 Lifecycle Rule** (auto-archive to Glacier after 90 days):

```hcl
provider "aws" {{
  region = "{target_region}"
}}

resource "aws_s3_bucket_lifecycle_configuration" "logs_lifecycle" {{
  bucket = "cloudops-logs-prod-useast1"

  rule {{
    id     = "archive-old-logs"
    status = "Enabled"

    transition {{
      days          = 30
      storage_class = "STANDARD_IA"
    }}

    transition {{
      days          = 90
      storage_class = "GLACIER"
    }}

    expiration {{
      days = 365
    }}
  }}
}}
```""", "fallback"

            else:
                return f"""⚡ **[CloudOps AI Engine]**

Here is a general **Terraform (HCL)** security-hardened VPC Security Group for `{target_region}`:

```hcl
provider "aws" {{
  region = "{target_region}"
}}

resource "aws_security_group" "cloudops_secure_sg" {{
  name        = "cloudops-web-secure-sg"
  description = "CloudOps AI managed Security Group — HTTPS only"
  vpc_id      = "vpc-0123456789abcdef0"

  ingress {{
    description = "HTTPS Web Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{ ManagedBy = "CloudOps-AI", Environment = "production" }}
}}
```""", "fallback"

        # ---------------------------------------------------------------- #
        # General knowledge Q&A
        # ---------------------------------------------------------------- #
        elif any(kw in msg_lower for kw in ["lambda", "fargate", "serverless"]):
            return """⚡ **[CloudOps AI Engine]**

**AWS Lambda vs AWS Fargate:**

| Feature | AWS Lambda | AWS Fargate |
| :--- | :--- | :--- |
| **Architecture** | Function-as-a-Service (FaaS) | Serverless Container Execution |
| **Max Duration** | 15 minutes | Unlimited (long-running) |
| **Cold Starts** | 100ms–1s on cold invocation | ~0 after first start |
| **Pricing** | Per millisecond + invocation count | Per vCPU + Memory per second |
| **Best For** | Event-driven workers, webhooks | REST APIs, Docker microservices |

**CloudOps Recommendation:** Use **Lambda** for async event processing and **Fargate** for long-running API containers.""", "fallback"

        elif any(kw in msg_lower for kw in ["cost", "spend", "bill", "saving"]):
            summary = context.get("summary", {})
            cost = summary.get("monthly_cost", 14.67) if isinstance(summary, dict) else 14.67
            return f"""⚡ **[CloudOps AI Engine]**

**AWS Cost Analysis for `{target_region}`:**
- **Total Monthly Spend**: **${cost:.2f} USD**
- **Top Cost Driver**: Amazon EC2 (~70% of spend)
- **Top Optimization**: EBS gp2 → gp3 migration + idle EC2 termination

💡 Ask me: *"Generate Terraform code for EBS-001"* to get instant savings HCL code.""", "fallback"

        elif any(kw in msg_lower for kw in ["security", "port", "ssh", "vulnerability"]):
            sec = context.get("security_summary", {})
            score = sec.get("security_score", 75) if isinstance(sec, dict) else 75
            return f"""⚡ **[CloudOps AI Engine]**

**Security Posture Score: {score}/100**

🚨 **Critical Findings:**
- Security Group `sg-0a8b1c2d3e4f5a6b7` — Port 22 (SSH) open to `0.0.0.0/0`
- Security Group `sg-0f9e8d7c6b5a4f3e2` — Port 3306 (MySQL) open to `0.0.0.0/0`

💡 Ask me: *"Generate Terraform for SEC-001"* to get HCL that locks down these ports!""", "fallback"

        elif any(kw in msg_lower for kw in ["s3", "storage", "glacier", "bucket"]):
            return """⚡ **[CloudOps AI Engine]**

**S3 Storage Tiering Strategy:**

| Tier | Cost | Best For |
| :--- | :--- | :--- |
| S3 Standard | $0.023/GB/mo | Frequently accessed active data |
| S3 Standard-IA | $0.0125/GB/mo | Data accessed < once/month |
| S3 Glacier | $0.0036/GB/mo | Long-term archive (90+ days) |
| S3 Glacier Deep Archive | $0.00099/GB/mo | 7+ year compliance archives |

**CloudOps Tip:** Add an S3 Lifecycle Rule to auto-transition logs to Glacier after 90 days for ~84% storage cost reduction.""", "fallback"

        elif any(kw in msg_lower for kw in ["iam", "role", "permission", "policy"]):
            return """⚡ **[CloudOps AI Engine]**

**AWS IAM Security Best Practices:**

1. **Least Privilege**: Never grant `AdministratorAccess` to application roles — scope to minimum required actions.
2. **Root Account MFA**: Enforce MFA on the root account and disable all root API access keys.
3. **IAM Roles for EC2/ECS**: Use Instance Profiles instead of hardcoded credentials in application code.
4. **Access Analyzer**: Enable AWS IAM Access Analyzer to detect overly broad permissions across accounts.
5. **Audit Rotation**: Remove IAM users/roles with zero activity for 90+ days using IAM credential reports.""", "fallback"

        else:
            cost = context.get("summary", {}).get("monthly_cost", 14.67) if isinstance(context, dict) else 14.67
            sec_score = context.get("security_summary", {}).get("security_score", 75) if isinstance(context, dict) else 75
            return f"""⚡ **[CloudOps AI Engine]**

Hello! I am your **AWS CloudOps AI Copilot** for region `{target_region}`.

**Your Environment at a Glance:**
- 💰 **Monthly Spend**: ${cost:.2f} USD
- 🛡️ **Security Score**: {sec_score}/100
- ⚠️ **Top Risk**: 2 security groups with exposed management ports

**Try asking me:**
• *"What is the difference between Lambda and Fargate?"*
• *"Generate Terraform code for SEC-001"*  
• *"How do S3 Glacier lifecycle policies work?"*
• *"What are AWS IAM best practices?"*""", "fallback"
