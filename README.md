# CloudOps AI

## Enterprise AWS Infrastructure Intelligence, Security Governance, and Autonomous Remediation Platform

CloudOps AI is an enterprise cloud operations, compliance governance, and autonomous remediation platform designed to unify multi-account cloud observability, Well-Architected Framework evaluation, FinOps waste analysis, and one-click operational remediation into a unified, high-performance console.

The platform continuously evaluates cloud configuration telemetry against official industry standards, maps topological dependency networks, identifies financial waste, and allows cloud engineers to safely execute autonomous Boto3 remediation actions directly from the browser with permanent audit receipts.

---

## 1. System Architecture and Component Design

CloudOps AI uses a decoupled, stateless service-oriented architecture designed for low-latency telemetry collection, non-blocking data aggregation, zero credential persistence, and deterministic remediation execution.

```text
+---------------------------------------------------------------------------------------------------+
|                                         PRESENTATION TIER                                         |
|                                Next.js 16 + React 19 App Router                                   |
|                                                                                                   |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  | Overview Dashboard     |  | Well-Architected Tool    |  | Resource Dependency               |  |
|  | Real-Time Cloud Health |  | 5-Pillar Scorecard (WAF) |  | Topological Network Graph         |  |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  | FinOps Cost Explorer   |  | CloudWatch Telemetry     |  | Deep Service Analytics            |  |
|  | Spend Waste Treemap    |  | Time-Series Visualizer   |  | RDS, Lambda, EBS gp3, ECS         |  |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
|  | In-Context AI Copilot  |  | One-Click Remediation    |  | Credential Manager                |  |
|  | Terraform Generator    |  | Boto3 Modal & Audit Card |  | Multi-Account STS Auth            |  |
|  +------------------------+  +--------------------------+  +-----------------------------------+  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  | HTTPS REST Calls
                                                  | Headers: X-Session-Token, Content-Type
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                       APPLICATION API TIER                                        |
|                                     FastAPI Python 3.11 Engine                                    |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Session Store & Credential Manager                                                          |  |
|  | Ephemeral in-memory session manager, STS identity verification, zero persistent secrets     |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | Router Endpoints:                                                                           |  |
|  | /dashboard | /remediation/* | /graph | /copilot | /aws/verify | /aws/session | /health       |  |
|  +---------------------------------------------------------------------------------------------+  |
+------------------------+--------------------------------------------------+-----------------------+
                         |                                                  |
                         v                                                  v
+--------------------------------------------------+  +---------------------------------------------+
|          ANALYSIS & COMPLIANCE ENGINES           |  |       AUTONOMOUS AIOPS REMEDIATION          |
|                                                  |  |                                             |
| +----------------------------------------------+ |  | +-----------------------------------------+ |
| | Well-Architected 5-Pillar Evaluator          | |  | | Remediation Engine (remediation_service)| |
| | 26 Deterministic Rule Checks                 | |  | | Boto3 EC2, S3, and EBS API Executions    | |
| +----------------------------------------------+ |  | +-----------------------------------------+ |
| | FinOps Waste Scoring Engine                  | |  | | Audit Receipt Generator                 | |
| | Idle Compute & Storage Allocation Analysis   | |  | | Thread-safe UUID receipts with timing   | |
| +----------------------------------------------+ |  | +-----------------------------------------+ |
| | Topological Graph Builder                    | |  | | CloudOps Cache Invalidation             | |
| | Multi-tiered Dependency & Blast Radius Model | |  | | Instant state refresh on live account   | |
| +----------------------------------------------+ |  | +-----------------------------------------+ |
+------------------------+-------------------------+  +---------------------+-----------------------+
                         |                                                  |
                         +------------------------+-------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                   AWS TELEMETRY & INGESTION TIER                                  |
|                                Concurrent Boto3 Client Orchestrator                               |
|                                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  | Amazon EC2 Compute |  | Amazon S3 Storage  |  | AWS Security Groups|  | AWS Cost Explorer   |  |
|  | State, Types, IPs  |  | Encrypt, ACLs, Ver |  | Inbound Ports, SG  |  | MTD, Service Totals |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  | Amazon RDS DBs     |  | AWS Lambda FaaS    |  | Amazon EBS Disks   |  | CloudWatch Metrics  |  |
|  | Multi-AZ, Engines  |  | Runtimes, Memory   |  | gp2, gp3, Attached |  | CPU, Net, Disk, Mem |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      CONNECTED TARGET CLOUDS                                      |
|                       Live AWS Cloud Account (STS Identity Verification)                          |
|                                               OR                                                  |
|                        Deterministic Air-Gapped Simulation Engine (Demo)                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Autonomous One-Click Remediation Workflow

The platform features an AIOps remediation engine that translates security and configuration findings into verified cloud operations. Users review the proposed modification, customize target parameters, inspect the exact Boto3 API call signature, and apply the change in real-time or via safe demo simulation.

```text
+---------------------------------------------------------------------------------------------------+
|                                ONE-CLICK REMEDIATION STATE MACHINE                                |
+---------------------------------------------------------------------------------------------------+

 [Finding Detected]
         |
         | Example: SEC-001 (0.0.0.0/0 on Port 22/3389) or EBS-001 (gp2 volume)
         v
 [User Action: Click Auto-Fix]
         |
         v
 [RemediationModal Opened]
         |-- Environment Validation: Live AWS Account vs. Demo Simulation Mode
         |-- Parameter Customization: Target CIDR selection (VPC Subnet vs. Office LAN)
         |-- Boto3 Call Signature Preview:
         |      ec2.revoke_security_group_ingress(...)
         |      ec2.authorize_security_group_ingress(...)
         |-- Execution Confirmation
         v
 [POST /remediation/apply]
         |
         +----------------------------+----------------------------+
         | Live Mode (Boto3)                                       | Demo Mode (Simulation)
         v                                                         v
 [Boto3 Client Execution]                                  [Mock State Mutation]
   - ec2.revoke_security_group_ingress                       - Verify finding applicability
   - ec2.authorize_security_group_ingress                     - Emulate realistic API latency (~250ms)
   - ec2.modify_volume(VolumeType='gp3')                     - Generate synthetic resource mutation
   - s3.put_bucket_encryption
   - s3.put_public_access_block
         |                                                         |
         +----------------------------+----------------------------+
                                      |
                                      v
 [Audit Receipt Generation]
   - Unique Audit Receipt ID: AUDIT-SEC-001-XXXX-XXXX
   - Exact millisecond execution duration
   - Modified resource identification
   - AWS Account ID and Region metadata
   - Thread-safe storage in in-memory audit log
                                      |
                                      v
 [Cache Invalidation]
   - Invalidate server-side telemetry cache
   - Signal client-side dashboard state refresh
                                      |
                                      v
 [RemediationResult Modal Presented]
   - Verified checkmark and parameters summary
   - Copyable Audit Receipt ID
   - "Done & Refresh Live Dashboard" CTA
                                      |
                                      v
 [Dashboard Live State Updated]
   - Target recommendation marked as "Fixed & Verified"
   - Resource tables show updated configuration (e.g., gp3, encrypted, restricted)
```

### Supported Autonomous Remediation Actions

| Finding ID | Vulnerability / Inefficiency | Boto3 Remediation Action | Technical Impact |
|---|---|---|---|
| SEC-001 | Public ingress from 0.0.0.0/0 on Port 22 (SSH) or Port 3389 (RDP) | `ec2.revoke_security_group_ingress` + `ec2.authorize_security_group_ingress` | Revokes public access; authorizes trusted VPC or administrator CIDR block. |
| EBS-001 | Legacy gp2 storage incurring 20 percent higher cost | `ec2.modify_volume(VolumeType='gp3')` | Converts volume online with zero downtime; guarantees 3,000 IOPS and 125 MB/s baseline. |
| S3-001 | Unencrypted S3 bucket missing default encryption | `s3.put_bucket_encryption` | Applies AES-256 (SSE-S3) encryption with S3 Bucket Keys enabled. |
| S3-002 | S3 bucket without public access blocking | `s3.put_public_access_block` | Enables all 4 Public Access Block configuration flags immediately. |

---

## 3. Well-Architected Framework Compliance Architecture

The compliance engine evaluates infrastructure against the five official AWS Well-Architected Framework (WAF) pillars using 26 deterministic check definitions:

```text
                               AWS WELL-ARCHITECTED PILLARS
                                            |
      +---------------+-------------+-------+-------+---------------+
      |               |             |               |               |
      v               v             v               v               v
  [Security]       [Cost]     [Reliability]   [Performance]    [Operations]
   Pillar          Pillar        Pillar          Pillar           Pillar
   (30% Weight)    (25% Weight)  (20% Weight)    (15% Weight)     (10% Weight)
      |               |             |               |               |
      |-- SSH/RDP     |-- Stopped   |-- Multi-AZ    |-- Graviton/   |-- S3 Lifecycle
      |   Ingress     |   Compute   |   RDS HA      |   Nitro Arch  |   Archival
      |-- Database    |-- gp2->gp3  |-- S3 Version- |-- Dedicated   |-- Runtime
      |   Isolation   |   Savings   |   ing Backup  |   gp3 IOPS    |   Currency
      |-- S3 Default  |-- Orphaned  |-- Compute     |-- Lambda Cold |-- Tagging
      |   Encryption  |   Volumes   |   Redundancy  |   Starts      |   Standards
      |-- Public S3   |-- Memory    |-- ECS Task    |-- RDS Engine  |-- Centralized
      |   Blocks      |   Rightsiz. |   Resilience  |   Load        |   Logging
      |-- EBS KMS     |-- Budget    |-- CloudWatch  |-- Container   |-- IaC Plan
      |   Encryption  |   Forecast  |   Alarms      |   Sizing      |   Readiness
      |-- Root MFA    |             |               |               |
```

### Pillar Scoring Methodology
- Overall Score: Weighted average across all 5 pillars yielding a value between 0 and 100.
- Check Statuses:
  - Passed: Resource complies with AWS Well-Architected best practices.
  - Warning: Sub-optimal configuration, moderate over-provisioning, or non-critical inefficiency.
  - Failed: Critical exposure, public management port, unencrypted storage, or high financial waste.

---

## 4. Resource Dependency Topology and Blast Radius Modeling

The platform constructs an interactive directed acyclic graph (DAG) representing topological relationships across network, compute, database, and storage boundaries:

```text
TOPOLOGICAL DEPENDENCY HIERARCHY
================================

[Network Perimeter]       [Firewall Boundaries]      [Compute / Serverless]     [Storage & Database]
      Col 0                      Col 1                       Col 2                      Col 3

+-----------------+       +-------------------+       +------------------+       +------------------+
|                 |       |                   |       |                  |------>|  Amazon EBS      |
|   Amazon VPC    |<......|  Security Group   |<------|  Amazon EC2      |       |  Attached Volume |
|   172.31.0.0/16 |       |  Web / Ingress    |       |  Compute Virtual |       +------------------+
|                 |       |                   |       |                  |
+-----------------+       +-------------------+       +------------------+
                                    ^
                                    |                 +------------------+       +------------------+
                                    +.................|  Amazon RDS      |       |  Amazon S3       |
                                    | (Firewall Rule) |  Database Engine |       |  Storage Bucket  |
                                    |                 +------------------+       +------------------+
                          +-------------------+                                            ^
                          |                   |       +------------------+                 |
                          |  Security Group   |       |  AWS Lambda      |-----------------+
                          |  Database Tier    |       |  Serverless FaaS | (Event Trigger)
                          |                   |       +------------------+
                          +-------------------+
```

### Relationship Edge Taxonomy
- secured_by: Maps compute and database resources to their governing security groups.
- attached_disk: Links virtual compute instances to mounted EBS block volumes.
- in_vpc: Maps security groups, subnets, and instances to their parent VPC.
- s3_trigger: Documents event source triggers between object storage buckets and Lambda runtimes.

---

## 5. FinOps Cost Efficiency Analysis and Spend Treemap

The FinOps module translates raw AWS Cost Explorer billing data into a proportional treemap that correlates financial spend with resource utilization efficiency.

```text
PROPORTIONAL SPEND AND EFFICIENCY TREEMAP
=========================================
Area = Proportional Service Expenditure (USD)
Efficiency Rating = Resource Utilization / Cost Ratio

+---------------------------------------------+------------------------------------+
|                                             | Amazon Elastic Block Store         |
| Amazon EC2                                  | Spend: $35.00                      |
| Spend: $10.32                               | Efficiency: 25% (Wasteful)         |
| Efficiency: 50% (Needs Attention)           | Status: Orphaned & gp2 Volumes     |
| Status: Stopped Compute Incurring Storage   | Recoverable Savings: ~$7.00/mo     |
| Recoverable Savings: ~$5.40/mo              |                                    |
|                                             +------------------------------------+
|                                             | Amazon S3                          |
|                                             | Spend: $1.74 | Efficiency: 60%     |
|                                             +------------------+-----------------+
|                                             | AWS KMS          | CloudWatch      |
|                                             | Eff: 92% (Good)  | Eff: 85% (Good) |
+---------------------------------------------+------------------+-----------------+
```

### Efficiency Classification Bands
- Efficient (Score >= 70): Workloads utilizing modern instance families, S3 intelligent tiering, active KMS keys, and right-sized compute.
- Needs Attention (Score 30 to 69): Non-critical idle capacity, stopped compute retaining storage attachments, or legacy configurations.
- Wasteful (Score < 30): Immediate recoverable losses, unattached EBS volumes, unmigrated gp2 tiers, and abandoned resources.

---

## 6. Security Architecture and Credential Isolation Boundary

CloudOps AI implements a zero-retention security model where cloud credentials are never persisted to disk, databases, or logs:

```text
SECURITY AND CREDENTIAL ISOLATION BOUNDARY
==========================================

User Browser                     CloudOps API Server                 AWS Security Token Service
    |                                     |                                      |
    | 1. Input Access Key & Secret        |                                      |
    |------------------------------------>|                                      |
    |                                     | 2. sts:GetCallerIdentity Verification|
    |                                     |------------------------------------->|
    |                                     |                                      |
    |                                     | 3. Return Account ID, ARN, Region    |
    |                                     |<-------------------------------------|
    |                                     |                                      |
    | 4. Ephemeral UUID Session Issued    | [In-Memory Session Store Only]       |
    |<------------------------------------| Raw AWS Secret Keys Discarded        |
    |                                     | Session TTL: 3600 seconds            |
    |                                     |                                      |
    | 5. Subsequent Requests (X-Session)  |                                      |
    |------------------------------------>| 6. Authenticated Boto3 Calls         |
    |                                     |------------------------------------->|
```

### Governance Principles
1. Ephemeral In-Memory Storage: AWS credentials exist exclusively in volatile memory structures protected by a 3600-second time-to-live (TTL).
2. Principle of Least Privilege: Telemetry collection requires only read-level IAM permissions (`ec2:Describe*`, `s3:Get*`, `ce:Get*`, `rds:Describe*`, `cloudwatch:Get*`). Remediation requires scoped mutation permissions (`ec2:RevokeSecurityGroupIngress`, `ec2:ModifyVolume`, `s3:PutBucketEncryption`, `s3:PutAccountPublicAccessBlock`).
3. Air-Gapped Simulation Engine: Complete platform capability verification is supported without AWS credentials using the built-in deterministic simulation engine.

---

## 7. User Interface Design System and Structured Box Layout

The user interface follows a modern, minimal, high-contrast engineering layout designed for operational clarity and fast information scanning:

- Background Canvas: Slate-50 background (`#f8fafc`) providing soft contrast against pure white cards.
- Structured Cards: Modular white containers (`#ffffff`) with clean structural borders (`#e2e8f0`), rounded corners (`8px`), and subtle micro-shadows (`0 1px 3px rgba(0,0,0,0.03)`).
- Typography: System font stack with tight letter-spacing (`-0.02em` on titles), high-contrast headings (`#0f172a`), and neutral secondary text (`#64748b`).
- Minimal Status Badges: Soft pastel status pills with matching borders:
  - Success / Compliant: Background `#ecfdf5`, Text `#059669`, Border `#a7f3d0`
  - Warning / Attention: Background `#fffbeb`, Text `#d97706`, Border `#fde68a`
  - Critical / Risk: Background `#fef2f2`, Text `#dc2626`, Border `#fecaca`
  - Informational: Background `#f0f9ff`, Text `#0284c7`, Border `#bae6fd`
- Structured Action Callouts: Inset recommendation boxes with Boto3 SDK indicator chips, syntax-highlighted code blocks, and prominent action buttons.

---

## 8. Repository Structure and System Organization

```text
CloudOps AI Platform Hierarchy
|
+-- backend/                             FastAPI Python Application Engine
|   +-- app/
|   |   +-- ai/                          Intelligence & Copilot Modules
|   |   |   +-- bedrock.py               Amazon Bedrock Nova Lite inference client
|   |   |   +-- groq_client.py           High-speed LLM client with live telemetry context
|   |   |   +-- prompts.py               Structured prompt templates for diagnosis and IaC
|   |   |
|   |   +-- api/                         REST API Route Handlers
|   |   |   +-- auth_aws.py              AWS STS identity verification and session creation
|   |   |   +-- copilot.py               AI Copilot chat and Terraform generation endpoint
|   |   |   +-- dashboard.py             Aggregated dashboard telemetry endpoint
|   |   |   +-- graph.py                 Topological dependency graph endpoint
|   |   |   +-- remediation.py           One-click auto-remediation API routes
|   |   |
|   |   +-- aws/                         Concurrent Boto3 Service Collectors
|   |   |   +-- client.py                Boto3 session manager and client factory
|   |   |   +-- cloudwatch.py            Time-series metric stream aggregator
|   |   |   +-- cost_explorer.py         Month-to-date and service cost collector
|   |   |   +-- deep_services.py         RDS, Lambda, EBS, and ECS analytics
|   |   |   +-- ec2.py                   Virtual compute and IP management
|   |   |   +-- relationships.py         Resource dependency graph construction engine
|   |   |   +-- s3.py                    Storage bucket security and encryption audit
|   |   |   +-- security.py              Security group ingress and port vulnerability audit
|   |   |
|   |   +-- lib/                         Static Definitions and Mock Data
|   |   |   +-- demo_data.py             Deterministic demonstration dataset
|   |   |
|   |   +-- services/                    Core Business Logic and Evaluators
|   |   |   +-- analyzer.py              Rule-based infrastructure finding generator
|   |   |   +-- compliance_service.py    Well-Architected Framework 5-pillar scoring engine
|   |   |   +-- dashboard_service.py     Orchestration engine and FinOps waste calculator
|   |   |   +-- remediation_service.py   Autonomous Boto3 remediation and audit engine
|   |   |
|   |   +-- sessions/                    Session Lifecycle Management
|   |   |   +-- session_store.py         Thread-safe in-memory session manager with TTL
|   |   |
|   |   +-- config.py                    Application configuration and environment settings
|   |   +-- main.py                      FastAPI application entrypoint, CORS, and routers
|   |
|   +-- test_remediation.py              Automated test suite for remediation operations
|   +-- Dockerfile                       Container specification for backend deployment
|   +-- requirements.txt                 Python package dependencies
|
+-- frontend/                            Next.js 16 App Router Application
|   +-- src/
|   |   +-- app/                         Page Routes and Views
|   |   |   +-- page.tsx                 Primary Overview Dashboard
|   |   |   +-- ai-insights/page.tsx     Executive AI Bedrock Intelligence Report View
|   |   |   +-- compliance/page.tsx      Well-Architected 5-Pillar Compliance Scorecard
|   |   |   +-- copilot/page.tsx         Interactive AI DevOps Copilot Workspace
|   |   |   +-- cost/page.tsx            Cost Explorer and FinOps Waste Treemap
|   |   |   +-- ec2/page.tsx             EC2 Compute Inventory and State View
|   |   |   +-- graph/page.tsx           Interactive Resource Dependency Graph Canvas
|   |   |   +-- metrics/page.tsx         CloudWatch Performance Metric Charts
|   |   |   +-- s3/page.tsx              S3 Storage Inventory and Encryption Posture
|   |   |   +-- security/page.tsx        Security Group Ingress Guardrails Analyzer
|   |   |   +-- services-analytics/      Deep Analytics for RDS, Lambda, EBS, and ECS
|   |   |   +-- settings/page.tsx        AWS Account Credential Manager
|   |   |   +-- globals.css              Modern minimalist stylesheet and token definitions
|   |   |   +-- layout.tsx               Root document layout and metadata
|   |   |
|   |   +-- components/                  Reusable UI Components
|   |   |   +-- AICopilotDrawer.tsx      Quick-access sliding AI copilot drawer
|   |   |   +-- AIReportCard.tsx         Amazon Bedrock intelligence score and report card
|   |   |   +-- AWSConnectModal.tsx      Modal dialog for live AWS credential input
|   |   |   +-- ComplianceScoreCard.tsx  Radar/Spider chart and pillar summary widgets
|   |   |   +-- CostChart.tsx            Service spend distribution bar charts
|   |   |   +-- EBSTable.tsx             EBS volume table with inline gp3 upgrade triggers
|   |   |   +-- EC2Table.tsx             EC2 compute instance inventory table
|   |   |   +-- MetricCard.tsx           Summary KPI stat widget with left-accent border
|   |   |   +-- Navbar.tsx               Header bar with backend status and account badges
|   |   |   +-- PillarDetails.tsx        Filterable Well-Architected check findings table
|   |   |   +-- RecommendationsList.tsx  Actionable recommendations with Auto-Fix triggers
|   |   |   +-- RemediationModal.tsx     Confirmation dialog with Boto3 code preview
|   |   |   +-- RemediationResult.tsx    Audit receipt card with duration and technical details
|   |   |   +-- ResourceGraph.tsx        React Flow topological network canvas
|   |   |   +-- ResourceNode.tsx         Custom React Flow node with AWS badges and status
|   |   |   +-- S3Table.tsx              S3 storage bucket table with inline fix triggers
|   |   |   +-- SecurityTable.tsx        Security group table with port exposure warnings
|   |   |   +-- Sidebar.tsx              Navigation sidebar with active states
|   |   |   +-- WasteHeatmap.tsx         FinOps proportional spend treemap visualizer
|   |   |
|   |   +-- lib/                         Client-Side State and API Wrappers
|   |       +-- api.ts                   TypeScript interfaces, API client, and mock stores
|   |
|   +-- package.json                     Node.js dependencies and script definitions
|   +-- Dockerfile                       Container specification for frontend deployment
|
+-- docker-compose.yml                   Multi-container local deployment orchestrator
+-- render.yaml                          Render cloud deployment blueprint
+-- PROJECT_PLAN.md                      Architecture roadmap and feature milestones
+-- README.md                            Comprehensive system documentation and architecture guide
```

---

## 9. REST API Specification and Endpoint Catalog

All protected endpoints accept the `X-Session-Token` HTTP header to identify the active AWS caller session. If omitted, the platform defaults to the deterministic demonstration engine.

| Endpoint | Method | Purpose | Request Body / Parameters | Key Response Properties |
|---|---|---|---|---|
| `/health` | GET | Platform Health Check | None | `status`, `version`, `live_aws_ready` |
| `/dashboard` | GET | Aggregated Dashboard Telemetry | `refresh` (query, boolean) | `summary`, `ec2`, `s3`, `cost_by_service`, `recommendations`, `ai_report`, `compliance`, `deep_services` |
| `/remediation/apply` | POST | Execute One-Click Auto-Fix | `{"finding_id": "SEC-001", "resource_id": "sg-123", "parameters": {}}` | `success`, `audit_id`, `action_taken`, `execution_time_ms`, `details`, `timestamp` |
| `/remediation/audit-log` | GET | Retrieve Remediation Audit Trail | `limit` (query, integer) | `audit_entries` (array of immutable audit receipts) |
| `/remediation/supported` | GET | Catalog of Remediable Findings | None | `supported_remediations` (array of supported finding IDs, descriptions, and boto3 signatures) |
| `/graph` | GET | Topological Dependency Network | None | `nodes`, `edges`, `summary` |
| `/copilot` | POST | AI Copilot Chat & IaC Synthesis | `{"message": "...", "mode": "chat\|terraform"}` | `response`, `model`, `mode`, `suggested_actions` |
| `/aws/verify` | POST | STS Credential Validation | `{"access_key_id": "...", "secret_access_key": "...", "region": "..."}` | `success`, `account_id`, `arn`, `session_token`, `expires_in` |
| `/aws/session` | GET | Current Session State | Header: `X-Session-Token` | `is_authenticated`, `account_id`, `region`, `is_demo` |
| `/aws/disconnect` | POST | Invalidate Session | Header: `X-Session-Token` | `disconnected: true` |

---

## 10. Installation and Local Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18.17 or higher
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env` (optional for local demo mode):
   ```env
   PORT=8000
   GROQ_API_KEY=your_groq_api_key_here
   DEFAULT_REGION=us-east-1
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in a modern web browser.

### Running Automated Test Suite
To verify the remediation engine and API routes:
```bash
cd backend
python test_remediation.py
```

---

## 11. Technology Stack Summary

- Frontend Engine: Next.js 16, React 19, TypeScript, Vanilla CSS
- Topological Network Canvas: React Flow (@xyflow/react)
- Backend Engine: FastAPI, Python 3.11, Pydantic v2, Uvicorn
- Cloud SDK: Amazon Web Services Boto3
- AI & Language Models: Amazon Bedrock (Nova Lite), Groq LLaMA Inference Engine
- Packaging: Docker, Docker Compose, Render Blueprint