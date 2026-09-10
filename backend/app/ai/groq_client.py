# app/ai/groq_client.py
"""
Groq-powered AI Copilot for CloudOps AI.

Uses the platform's own Groq API key (llama-3.3-70b-versatile) so users
never need to configure an AI key themselves.

The copilot receives the user's connected AWS account data as context,
allowing it to answer both:
  - General DevOps / AWS / Terraform questions
  - Questions specific to the user's actual infrastructure
    (e.g., "what is my monthly cost?", "which security groups are risky?")
"""

import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger("cloudops.ai.groq")

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are CloudOps AI Copilot, an expert AWS DevOps engineer and cloud architect embedded inside the CloudOps AI dashboard.

Your capabilities:
1. Answer any AWS, DevOps, cloud architecture, or Terraform question with expert-level depth.
2. When the user's live AWS infrastructure context is provided, use it to give account-specific answers (real costs, real resource counts, real security findings, etc.).
3. Generate production-ready Terraform (HCL) code when asked. Always wrap HCL in triple-backtick hcl fences.
4. Explain AWS services, best practices, cost optimization strategies, and security hardening.

Personality: Professional, concise, helpful. Use markdown formatting — headings, bullet points, tables, and code blocks where appropriate.

IMPORTANT: If the user asks about their infrastructure (costs, instances, buckets, security score, etc.) and the context below contains that data, use the real numbers from context — do NOT make up data.
"""

# ---------------------------------------------------------------------------
# GroqCopilot service
# ---------------------------------------------------------------------------

class GroqCopilot:
    """
    Groq-powered AI copilot. Falls back to the rich rule-based engine if
    the Groq API key is not configured or the API call fails.
    """

    def __init__(self):
        self._client = None
        self._available = False

        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY is not set — copilot will use fallback engine")
            return

        try:
            from groq import Groq  # type: ignore
            self._client = Groq(api_key=settings.GROQ_API_KEY)
            self._available = True
            logger.info("Groq copilot initialised (model: %s)", settings.GROQ_MODEL)
        except ImportError:
            logger.error("groq package not installed. Run: pip install groq")
        except Exception as exc:
            logger.error("Failed to initialise Groq client: %s", exc)

    # ------------------------------------------------------------------ #
    # Public: chat
    # ------------------------------------------------------------------ #

    def chat(
        self,
        message: str,
        aws_context: Optional[dict] = None,
        mode: str = "chat",
    ) -> tuple[str, str]:
        """
        Returns (reply_text, engine_source).
        engine_source is 'groq' or 'fallback'.
        """
        if self._available and self._client:
            try:
                return self._call_groq(message, aws_context, mode)
            except Exception as exc:
                logger.warning("Groq API call failed: %s — using fallback", exc)

        return self._rule_based_fallback(message, aws_context, mode)

    # ------------------------------------------------------------------ #
    # Internal: Groq API call
    # ------------------------------------------------------------------ #

    def _call_groq(
        self,
        message: str,
        aws_context: Optional[dict],
        mode: str,
    ) -> tuple[str, str]:
        context_block = self._build_context_block(aws_context, mode)

        system_content = SYSTEM_PROMPT
        if context_block:
            system_content += (
                "\n\n--- User's Live AWS Infrastructure Context ---\n"
                + context_block
            )

        response = self._client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": message},
            ],
            temperature=0.4,
            max_tokens=800,  # Groq free tier: 1000 OTPM limit
        )

        reply = response.choices[0].message.content or ""
        logger.info("Groq response generated (%d chars)", len(reply))
        return (
            f"🤖 **[Generated Live by Groq · {settings.GROQ_MODEL}]**\n\n{reply}",
            "groq",
        )

    def _build_context_block(self, aws_context: Optional[dict], mode: str) -> str:
        """Convert the dashboard context dict into a readable string for the LLM."""
        if not aws_context:
            return ""

        lines = []
        region = aws_context.get("region", "us-east-1")
        lines.append(f"AWS Region: {region}")

        summary = aws_context.get("summary", {})
        if summary:
            lines.append(f"Monthly Cost (MTD): ${summary.get('monthly_cost', 0):.2f} USD")
            lines.append(f"EC2 Instances: {summary.get('ec2_count', 0)}")
            lines.append(f"S3 Buckets: {summary.get('s3_bucket_count', 0)}")
            lines.append(f"Lambda Functions: {summary.get('lambda_count', 0)}")
            lines.append(f"RDS Instances: {summary.get('rds_count', 0)}")
            savings = summary.get("gp3_monthly_savings", 0)
            if savings:
                lines.append(f"Potential gp2->gp3 EBS Savings: ${savings:.2f}/month")

        sec = aws_context.get("security_summary", {})
        if sec:
            lines.append(f"Security Posture Score: {sec.get('security_score', 0)}/100")
            lines.append(f"Critical Security Groups: {sec.get('critical_risk_count', 0)}")
            open_ports = sec.get("open_critical_ports", [])
            if open_ports:
                port_list = ", ".join(
                    f"Port {p.get('port')} on {p.get('group_id', 'unknown')}"
                    for p in open_ports[:5]
                )
                lines.append(f"Exposed Critical Ports: {port_list}")

        recs = aws_context.get("recommendations", [])
        if recs:
            lines.append("\nTop Recommendations:")
            for r in recs[:4]:
                title = r.get("title") or r.get("action", "")
                if title:
                    lines.append(f"  - {title}")

        if mode == "terraform":
            lines.append(
                "\nThe user wants Terraform (HCL) code. "
                "Provide complete, production-ready HCL inside triple-backtick hcl fences."
            )

        return "\n".join(lines)

    # ------------------------------------------------------------------ #
    # Fallback: rule-based engine
    # ------------------------------------------------------------------ #

    def _rule_based_fallback(
        self,
        message: str,
        aws_context: Optional[dict],
        mode: str,
    ) -> tuple[str, str]:
        msg = message.lower()
        region = (aws_context or {}).get("region", "us-east-1")
        summary = (aws_context or {}).get("summary", {})
        sec = (aws_context or {}).get("security_summary", {})
        cost = summary.get("monthly_cost", 0.0) if isinstance(summary, dict) else 0.0
        sec_score = sec.get("security_score", 75) if isinstance(sec, dict) else 75

        tag = "⚡ **[CloudOps AI Engine]**"

        if any(k in msg for k in ["cost", "spend", "bill", "saving"]):
            return (
                f"{tag}\n\n"
                f"**Your AWS Cost Summary (`{region}`):**\n"
                f"- Month-to-Date Spend: **${cost:.2f} USD**\n"
                f"- Top optimization: EBS `gp2` -> `gp3` migration (20% instant savings)\n\n"
                f"Ask me: *\"Generate Terraform for EBS gp3 migration\"*",
                "fallback",
            )

        if any(k in msg for k in ["security", "port", "ssh", "vulnerability", "sec-001"]):
            return (
                f"{tag}\n\n"
                f"**Security Posture Score: {sec_score}/100**\n\n"
                f"Critical Findings:\n"
                f"- Port 22 (SSH) open to `0.0.0.0/0`\n"
                f"- Port 3306 (MySQL) open to `0.0.0.0/0`\n\n"
                f"Ask me: *\"Generate Terraform for SEC-001\"* to fix these now.",
                "fallback",
            )

        if any(k in msg for k in ["terraform", "hcl", "ebs", "gp3", "ebs-001"]):
            return (
                f"{tag}\n\nHere is Terraform to migrate EBS `gp2` -> `gp3` (EBS-001):\n\n"
                "```hcl\n"
                f'provider "aws" {{\n  region = "{region}"\n}}\n\n'
                'resource "aws_ebs_volume" "app_storage" {\n'
                f'  availability_zone = "{region}a"\n'
                "  size              = 200\n"
                '  type              = "gp3"\n'
                "  iops              = 3000\n"
                "  throughput        = 125\n"
                "  encrypted         = true\n"
                '  tags = { Name = "cloudops-vol", ManagedBy = "CloudOps-AI" }\n'
                "}\n```",
                "fallback",
            )

        return (
            f"{tag}\n\n"
            f"Hello! I'm your **CloudOps AI Copilot** for `{region}`.\n\n"
            f"**Your Environment:**\n"
            f"- Monthly Spend: ${cost:.2f} USD\n"
            f"- Security Score: {sec_score}/100\n\n"
            f"**Try asking me:**\n"
            f"- *\"What is my monthly cost breakdown?\"*\n"
            f"- *\"Generate Terraform for SEC-001\"*\n"
            f"- *\"How do I set up S3 Lifecycle rules?\"*\n"
            f"- *\"Explain AWS Lambda vs Fargate\"*",
            "fallback",
        )


# Singleton instance — shared across all requests
groq_copilot = GroqCopilot()
