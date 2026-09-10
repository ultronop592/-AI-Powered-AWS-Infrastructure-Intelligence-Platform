# CloudOps AI

## AWS Infrastructure Intelligence, Security Governance, and Autonomous Operations Platform

CloudOps AI is an enterprise cloud operations, compliance governance, and infrastructure visualization platform designed to unify cloud observability, multi-pillar architectural evaluation, FinOps waste analysis, and AI-assisted DevOps remediation into a unified operational console.

The platform transforms raw cloud configuration telemetry into actionable intelligence, scoring connected accounts against official cloud engineering standards, generating topological relationship networks, and diagnosing infrastructure inefficiencies.

---

## 1. Executive Summary and Problem Statement

Modern cloud architectures span dozens of distributed AWS services, creating visibility silos, unmonitored configuration drift, security vulnerabilities, and runaway financial waste. Engineering teams routinely manage disparate consoles for compute inventories, storage configurations, security group ingress rules, database backups, and cost allocation.

CloudOps AI addresses these operational challenges through:

1. Unified Architecture Observability: Consolidating compute, serverless, storage, network, and security guardrail telemetry into a cohesive console interface.
2. Automated Architectural Compliance: Evaluating workloads against the five pillars of the AWS Well-Architected Framework using deterministic rule evaluation.
3. Topological Infrastructure Graphing: Visualizing resource dependencies, network perimeters, firewall attachments, and event triggers through a multi-tiered directed graph.
4. FinOps Cost Efficiency Analysis: Translating raw billing data into an interactive proportional treemap heatmap that correlates dollar spend with resource utilization efficiency.
5. In-Context AI DevOps Copilot: Ingesting live cloud telemetry into high-speed language models to answer infrastructure inquiries and formulate production-ready Terraform Infrastructure-as-Code remediation modules.

---

## 2. System Architecture and Component Design

The platform uses a decoupled, stateless service-oriented architecture designed for low-latency telemetry collection, non-blocking data aggregation, and zero persistence of customer credentials.

```text
+-----------------------------------------------------------------------------------+
|                                PRESENTATION TIER                                  |
|                            Next.js 16 + React 19 Engine                           |
|                                                                                   |
|  +---------------------+  +----------------------+  +--------------------------+  |
|  | Overview Dashboard  |  | Well-Architected WAF |  | Resource Dependency      |  |
|  | Compute & Storage   |  | Compliance Scorecard |  | Topology Graph           |  |
|  +---------------------+  +----------------------+  +--------------------------+  |
|  +---------------------+  +----------------------+  +--------------------------+  |
|  | FinOps Treemap      |  | CloudWatch Telemetry |  | AI DevOps Copilot        |  |
|  | Waste Heatmap       |  | Metrics Visualizer   |  | Interactive Workspace    |  |
|  +---------------------+  +----------------------+  +--------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           | HTTPS REST Requests
                                           | X-Session-Token Identification
                                           v
+-----------------------------------------------------------------------------------+
|                               APPLICATION API TIER                                |
|                               FastAPI Core Engine                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Session Store & Authentication Manager                                      |  |
|  | In-memory TTL session management, STS identity verification, token issuance  |  |
|  +-----------------------------------------------------------------------------+  |
|  | Router Endpoints: /dashboard | /graph | /copilot | /aws/verify              |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+--------------------------------------+       +------------------------------------+
|       INTELLIGENCE & ANALYSIS        |       |        PLATFORM AI COPILOT         |
|                                      |       |                                    |
| +----------------------------------+ |       | +--------------------------------+ |
| | Well-Architected Evaluator       | |       | | Groq LLM Inference Engine      | |
| | 5-Pillar Rule Evaluation         | |       | | Platform-owned API credentials | |
| +----------------------------------+ |       | +--------------------------------+ |
| | FinOps Waste Scoring Engine      | |       | | Live Infrastructure Context    | |
| | Spend vs. Utility Correlation    | |       | | Real-time state injection      | |
| +----------------------------------+ |       | +--------------------------------+ |
| | Topological Graph Builder        | |       | | Terraform HCL Generator        | |
| | Resource Dependency Mapping      | |       | | Autonomous remediation modules | |
| +----------------------------------+ |       | +--------------------------------+ |
+------------------+-------------------+       +------------------------------------+
                   |
                   v
+-----------------------------------------------------------------------------------+
|                           AWS TELEMETRY & INGESTION TIER                          |
|                       Concurrent Boto3 Client Orchestrator                        |
|                                                                                   |
|  +------------------+ +------------------+ +-----------------+ +----------------+ |
|  | Amazon EC2       | | Amazon S3        | | AWS Security    | | AWS Cost       | |
|  | Virtual Compute  | | Object Storage   | | Security Groups | | Explorer API   | |
|  +------------------+ +------------------+ +-----------------+ +----------------+ |
|  +------------------+ +------------------+ +-----------------+ +----------------+ |
|  | Amazon RDS       | | AWS Lambda       | | Amazon EBS      | | CloudWatch     | |
|  | Databases        | | Serverless FaaS  | | Block Volumes   | | Metric Streams | |
|  +------------------+ +------------------+ +-----------------+ +----------------+ |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                               TARGET CLOUD ACCOUNTS                               |
|              Live AWS Account (STS Authenticated) OR Built-in Demo Engine         |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Functional Pillars and Engineering Concepts

### 3.1. AWS Well-Architected Framework Compliance Engine

The compliance engine performs non-invasive audits of cloud environments mapped across the five foundational pillars defined by AWS:

```text
                               AWS WELL-ARCHITECTED PILLARS
                                            |
      +---------------+-------------+-------+-------+---------------+
      |               |             |               |               |
      v               v             v               v               v
  [Security]       [Cost]     [Reliability]   [Performance]    [Operations]
   Pillar          Pillar        Pillar          Pillar           Pillar
      |               |             |               |               |
      |-- SSH/RDP     |-- Stopped   |-- Multi-AZ    |-- Graviton/   |-- S3 Lifecycle
      |   Ingress     |   EC2 Disks |   RDS HA      |   Nitro Arch  |   Archival
      |-- Database    |-- gp2->gp3  |-- S3 Version- |-- Dedicated   |-- Runtime
      |   Isolation   |   Savings   |   ing DR      |   gp3 IOPS    |   Currency
      |-- S3 Default  |-- Orphaned  |-- Compute     |-- Lambda Cold |-- Tagging
      |   Encryption  |   Volumes   |   Redundancy  |   Starts      |   Standards
      |-- Public S3   |-- Memory    |-- ECS Task    |-- RDS Engine  |-- Centralized
      |   Blocks      |   Rightsiz. |   Resilience  |   Load        |   Logging
      |-- EBS KMS     |-- Budget    |-- CloudWatch  |-- Container   |-- IaC Plan
      |   Encryption  |   Forecast  |   Alarms      |   Sizing      |   Readiness
      |-- Root MFA    |             |               |               |
```

The system computes an overall weighted architectural score between 0 and 100 based on standard industry risk priorities:
- Security Posture: 30 percent weight
- Cost Optimization: 25 percent weight
- Reliability and Fault Tolerance: 20 percent weight
- Performance Efficiency: 15 percent weight
- Operational Excellence: 10 percent weight

Each individual check yields one of three deterministic states:
- Passed: The resource satisfies official AWS security and engineering baselines.
- Warning: Non-critical inefficiency, sub-optimal configuration, or elevated spend threshold.
- Failed: High or critical exposure, including unencrypted data, publicly reachable management ports, or orphaned billing artifacts.

---

### 3.2. Resource Dependency and Topological Network Graph

CloudOps AI maps infrastructure components as a directed graph where nodes represent discrete AWS entities and edges represent relationships, dependencies, and network boundaries.

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

#### Graph Modeling Taxonomy
- Nodes: Encapsulate resource identification, AWS service category, operational runtime status, risk classification, and configuration properties.
- Edges: Explicit directional connections modeling architectural dependencies:
  - Ingress Protection (secured_by): Associating compute instances and database engines with their respective firewall groups.
  - Storage Attachment (attached_disk): Linking virtual machines to mounted block volumes.
  - Network Encapsulation (in_vpc): Mapping security groups and subnets into parent Virtual Private Clouds.
  - Serverless Invocation (s3_trigger): Documenting event source mappings between object storage buckets and execution runtimes.

---

### 3.3. FinOps Resource Waste and Cost Efficiency Heatmap

Traditional cost tools present billing data as isolated bar charts or line items. CloudOps AI employs a multi-dimensional proportional treemap visualization to correlate monetary expenditure with resource utility.

```text
PROPORTIONAL SPEND & EFFICIENCY TREEMAP CONCEPT
===============================================
Total Area = Total Month-to-Date Cloud Spend
Box Geometry = Proportional Service Expenditure
Color Spectrum = Cost Efficiency Rating

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

#### Efficiency Scoring Framework
The FinOps analyzer classifies each billed AWS service across three operational bands:
- Cost-Efficient (Score greater than 70): Workloads utilizing modern instance types, automated storage tiering, active KMS customer keys, and consolidated logging streams.
- Needs Optimization (Score 30 to 70): Environments with non-critical idle capacity, stopped compute retaining storage attachments, or legacy configuration baselines.
- Wasteful (Score less than 30): Immediate recoverable losses, including unattached block storage volumes, unmigrated legacy storage tiers, and abandoned database instances.

---

### 3.4. Platform AI Copilot with Context-Injected Inference

The platform incorporates an integrated AI DevOps Copilot powered by a dedicated inference gateway. Rather than requiring users to configure proprietary model access or pay per-token charges, the platform provides managed inference out-of-the-box.

```text
IN-CONTEXT REASONING WORKFLOW
=============================

1. User Inquiry Input
   ("Why is my EBS spend high and how do I fix it?")
            |
            v
2. Context Ingestion Layer
   Extracts current environment snapshot:
   - Month-to-Date spend per service
   - Compute inventory and stopped instance counts
   - Unattached and gp2 block volume counts
   - Security Group open port exposure listings
   - Active Well-Architected compliance deficiencies
            |
            v
3. System Prompt Synthesis
   Combines AWS DevOps Engineering persona, structured markdown
   formatting rules, and the extracted live environment snapshot
            |
            v
4. High-Speed Model Inference
   Deep-reasoning language model evaluates user prompt
   against actual infrastructure telemetry
            |
            v
5. Production-Ready Remediation Output
   - Plain-language diagnostic summary referencing real resource IDs
   - Validated, region-aware Terraform (HCL) remediation code blocks
```

---

## 4. Security, Governance, and Credential Isolation

CloudOps AI is architected with a strict zero-retention credential model:

```text
SECURITY & CREDENTIAL ISOLATION BOUNDARY
========================================

User Browser                     CloudOps API Server                 AWS Security Token Service
    |                                     |                                      |
    | 1. Input Access Key & Secret        |                                      |
    |------------------------------------>|                                      |
    |                                     | 2. sts:GetCallerIdentity Verification|
    |                                     |------------------------------------->|
    |                                     |                                      |
    |                                     | 3. Returns Account ID & User ARN     |
    |                                     |<-------------------------------------|
    |                                     |                                      |
    | 4. Ephemeral UUID Session Issued    | [In-Memory Session Store Only]       |
    |<------------------------------------| Raw AWS Secret Keys DISCARDED        |
    |                                     | Session TTL: 3600 seconds            |
    |                                     |                                      |
    | 5. Subsequent Requests (X-Session)  |                                      |
    |------------------------------------>| 6. Authenticated Boto3 Calls         |
    |                                     |------------------------------------->|
```

### Governance Safeguards
1. No Persistent Database for Secrets: AWS access credentials are held exclusively in short-lived server memory structures tied to an expiring session token.
2. Read-Only Telemetry Ingestion: The system relies on read-level AWS APIs (describe, list, get) to analyze state without modifying running configurations.
3. Air-Gapped Demonstration Mode: An embedded deterministic mock generator enables complete platform evaluation, UI exploration, and compliance reviews without active cloud credentials.

---

## 5. Repository Structure and System Organization

```text
CloudOps AI Platform Hierarchy
|
+-- backend/                             FastAPI Python Application
|   +-- app/
|   |   +-- ai/                          Intelligence & Copilot Integrations
|   |   |   +-- bedrock.py               Amazon Bedrock client and fallback engine
|   |   |   +-- groq_client.py           Platform-managed AI Copilot with context injection
|   |   |   +-- prompts.py               Structured evaluation and remediation prompt templates
|   |   |
|   |   +-- api/                         REST API Route Handlers
|   |   |   +-- auth_aws.py              AWS STS identity verification and session creation
|   |   |   +-- copilot.py               AI Copilot chat and Terraform generation endpoint
|   |   |   +-- dashboard.py             Aggregated dashboard telemetry endpoint
|   |   |   +-- graph.py                 Topological dependency graph endpoint
|   |   |
|   |   +-- aws/                         AWS Boto3 Service Collectors
|   |   |   +-- client.py                Boto3 session manager and client factory
|   |   |   +-- cloudwatch.py            Time-series metric aggregator
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
|   |   |
|   |   +-- sessions/                    Session Lifecycle Management
|   |   |   +-- session_store.py         Thread-safe in-memory session manager with TTL
|   |   |
|   |   +-- config.py                    Application configuration and environment settings
|   |   +-- main.py                      FastAPI application entrypoint, CORS, and lifespan
|   |
|   +-- Dockerfile                       Container specification for backend deployment
|   +-- requirements.txt                 Python package dependencies
|
+-- frontend/                            Next.js 16 App Router Application
|   +-- src/
|   |   +-- app/                         Page Routes and Navigation
|   |   |   +-- page.tsx                 Primary Overview Dashboard
|   |   |   +-- ai-insights/page.tsx     Executive AI Advisory Report View
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
|   |   |   +-- globals.css              AWS Management Console Light Theme stylesheet
|   |   |   +-- layout.tsx               Root document layout and metadata
|   |   |
|   |   +-- components/                  Reusable UI Components
|   |   |   +-- ComplianceScoreCard.tsx  Radar/Spider chart and pillar summary widgets
|   |   |   +-- CostChart.tsx            Service spend distribution bar charts
|   |   |   +-- MetricCard.tsx           Summary KPI stat widget
|   |   |   +-- Navbar.tsx               Header bar with backend status and account badges
|   |   |   +-- PillarDetails.tsx        Filterable Well-Architected check findings table
|   |   |   +-- ResourceGraph.tsx        React Flow topological network canvas
|   |   |   +-- ResourceNode.tsx         Custom React Flow node with AWS badges and status
|   |   |   +-- Sidebar.tsx              AWS Console navigation drawer
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
+-- README.md                            Enterprise documentation and architecture guide
```

---

## 6. Functional Capabilities Summary

| Capability | Engineering Purpose | Architectural Mechanism |
|---|---|---|
| Well-Architected Compliance | Quantifies cloud maturity against AWS certification standards | 26 automated rule checks scoring Security, Cost, Reliability, Performance, and Operations |
| Resource Dependency Graph | Exposes blast radius, network perimeters, and resource connections | Multi-column directed topological graph built with React Flow |
| FinOps Waste Treemap | Uncovers idle compute and unattached disks proportional to spend | 2D squarified treemap bounding boxes with three-tier efficiency scoring |
| Platform AI Copilot | Delivers contextual DevOps diagnostics and Terraform IaC fixes | High-speed LLM inference gateway with real-time cloud state injection |
| Security Group Guardrails | Audits internet-exposed management ports and database listeners | Ingress rule analyzer detecting unrestricted 0.0.0.0/0 exposure |
| CloudWatch Telemetry | Monitors real-time virtual compute resource consumption | Interactive SVG time-series visualizer tracking CPU, Memory, Disk, and Network |
| Multi-Account Connect | Evaluates any AWS account on-demand without server restarts | STS caller identity verification paired with ephemeral session keys |
| Demonstration Mode | Provides full feature testing in credential-less environments | Deterministic mock state engine mirroring production response schemas |

---

## 7. Operational Standards and User Interface Philosophy

The user interface implements an authentic AWS Management Console Light Theme aesthetic:
- Neutral Foundation: Light grey background surfaces combined with pure white card containers.
- AWS Design System Accents: Official AWS orange and Amazon blue primary highlights.
- Clear Visual Hierarchy: High-contrast typography, discrete border separators, and zero intrusive glow effects.
- Purposeful State Indicators: Standardized operational badges indicating active, stopped, warning, and critical risk conditions.
- Information-Dense Layouts: Data-rich tables, inline progress metrics, and responsive vector visualizers optimized for cloud engineers and architecture review boards.