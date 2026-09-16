# 🎓 CloudOps AI — 4th Year Project Enhancement Plan

> **Project**: AI-Powered AWS Infrastructure Intelligence Platform  
> **Stack**: Next.js + FastAPI + Amazon Bedrock + Boto3  
> **Goal**: Evolve from a monitoring dashboard → a fully autonomous AIOps platform  
> **Total Estimated Time**: 6–8 weeks of focused development

---

## 📦 What You Already Have (Baseline)

| Module | Status |
|--------|--------|
| AWS Credential Connect (STS auth) | ✅ Done |
| EC2 / S3 / RDS / Lambda / ECS / EBS monitoring | ✅ Done |
| CloudWatch metrics + SVG charts | ✅ Done |
| Security Group audit + posture score | ✅ Done |
| AI Copilot (Bedrock + fallback engine) | ✅ Done |
| Terraform IaC code generation | ✅ Done |
| Cost Explorer + cost breakdown | ✅ Done |
| Cloud Health Score (composite) | ✅ Done |
| Docker Compose + ECS Fargate deploy | ✅ Done |
| Demo/mock fallback mode | ✅ Done |

---

## 🗓️ Phase Overview

| Phase | Focus | Duration | Features |
|-------|-------|----------|----------|
| **Phase 1** | AI / ML Core | Week 1–2 | Anomaly Detection, Cost Forecasting |
| **Phase 2** | AIOps Actions | Week 3–4 | Auto-Remediation, NL AWS Querying |
| **Phase 3** | Cloud Intelligence | Week 5–6 | Compliance Score, Dependency Graph, Waste Heatmap |
| **Phase 4** | Copilot Upgrades | Week 7–8 | Voice Copilot, Architecture Generator, Multi-Agent |

---

## 🔮 Phase 1: AI / ML Core (Week 1–2)

### Feature 1.1 — AI Anomaly Detection

**What it does**: Monitors CPU, memory, cost, and Lambda invocations in real-time.  
When it detects a statistical anomaly (e.g., 340% CPU spike) it fires a visual alert on the dashboard.

**Why it matters**: Moves the platform from *reactive reporting* → *proactive intelligence*. This is real ML.

#### Tech Stack
- `scikit-learn` — Isolation Forest model for anomaly detection
- `pandas` / `numpy` — time-series data processing
- AWS CloudWatch — source of historical metric data (already integrated)
- Frontend: New alert banner component with animated pulse effect

#### Backend Changes
```
backend/app/
  ai/
    anomaly_detector.py     [NEW] — IsolationForest model + scoring logic
  aws/
    cloudwatch.py           [MODIFY] — add get_metric_history() for 7-day data
  api/
    anomalies.py            [NEW] — GET /anomalies endpoint
  services/
    dashboard_service.py    [MODIFY] — include anomaly results in payload
```

#### Frontend Changes
```
frontend/src/
  app/
    metrics/page.tsx        [MODIFY] — show anomaly flags on charts
  components/
    AnomalyAlertBanner.tsx  [NEW] — red pulsing alert card
    AnomalyBadge.tsx        [NEW] — inline flag on metric charts
```

#### Implementation Steps
- [ ] Pull 7-day hourly CloudWatch data for CPU, Network, Lambda invocations
- [ ] Run Isolation Forest on each metric series (contamination=0.05)
- [ ] Return list of anomaly events: `{metric, timestamp, value, baseline, severity}`
- [ ] Render anomaly flags as red markers on the SVG line charts
- [ ] Add animated alert banner at top of Metrics page

**Estimated Time**: 4–5 days  
**Demo Talking Point**: *"The platform automatically detected a 340% CPU spike on instance i-0abc123 at 14:35 UTC — 3 hours before the service degraded."*

---

### Feature 1.2 — AI Cost Forecasting (30-Day Prediction)

**What it does**: Shows a 30-day cost forecast as a dashed projection line alongside actual spend, with a 95% confidence band.

**Why it matters**: FinOps (Cloud Financial Operations) is a real discipline. You are implementing its core tool from scratch.

#### Quick Win Approach (Day 1–2)
Use AWS Cost Explorer's built-in forecast API:
```python
response = ce_client.get_cost_forecast(
    TimePeriod={"Start": "2026-09-07", "End": "2026-10-07"},
    Metric="UNBLENDED_COST",
    Granularity="DAILY",
    PredictionIntervalLevel=95,
)
```

#### Advanced Approach (Day 3–5, optional)
Implement Facebook Prophet model for a richer academic writeup.

#### Backend Changes
```
backend/app/
  aws/
    cost_explorer.py        [MODIFY] — add get_cost_forecast() method
  api/
    dashboard.py            [MODIFY] — include forecast in /dashboard response
```

#### Frontend Changes
```
frontend/src/
  app/
    cost/page.tsx           [MODIFY] — add forecast chart section
  components/
    CostForecastChart.tsx   [NEW] — dual line chart: actual + forecast + band
```

#### Implementation Steps
- [ ] Add `get_cost_forecast()` to `CostExplorerService`
- [ ] Return `{date, amount, lower_bound, upper_bound}[]` from API
- [ ] Build dual-line SVG chart: solid = actual, dashed = forecast
- [ ] Add shaded confidence band between lower/upper bounds
- [ ] Show projected month-end total in a summary card

**Estimated Time**: 3–4 days  
**Demo Talking Point**: *"Based on current spend trajectory, the AI forecasts a $127.40 month-end total — 23% over budget. Action is needed now."*

---

## 🛠️ Phase 2: AIOps Actions (Week 3–4)

### Feature 2.1 — One-Click Auto-Remediation

**What it does**: Adds an **"Auto-Fix"** button next to each security or configuration finding.  
One click → boto3 applies the fix directly → shows audit confirmation.

**Why it matters**: Transforms the platform from a *read-only dashboard* into an *autonomous cloud operations tool* (AIOps). This is the biggest differentiator.

#### Supported Remediations (MVP)

| Finding ID | Boto3 Fix | Description |
|------------|-----------|-------------|
| SEC-001 | `revoke_security_group_ingress` + re-authorize with /32 CIDR | Restrict SSH/RDP from 0.0.0.0/0 |
| EBS-001 | `ec2.modify_volume(VolumeType='gp3')` | Upgrade gp2 → gp3 |
| S3-001 | `s3.put_bucket_encryption()` | Enable AES-256 default encryption |
| S3-002 | `s3.put_public_access_block()` | Enable all 4 public access blocks |

#### Backend Changes
```
backend/app/
  api/
    remediation.py          [NEW] — POST /remediation/apply endpoint
  services/
    remediation_service.py  [NEW] — boto3 fix logic per finding ID
```

#### Frontend Changes
```
frontend/src/
  components/
    RecommendationsList.tsx [MODIFY] — add "Auto-Fix" button per item
    RemediationModal.tsx    [NEW] — confirmation dialog before applying fix
    RemediationResult.tsx   [NEW] — success/error state card
```

#### Implementation Steps
- [x] Create `RemediationService` with one method per finding ID
- [x] POST `/remediation/apply` body: `{finding_id, resource_id, session_token}`
- [x] Add confirmation modal: *"This will modify sg-0abc123 in your live AWS account. Proceed?"*
- [x] On success: flash green "✅ Fixed!" badge + refresh dashboard data
- [x] Log every remediation: timestamp, session, resource_id, action_taken

**Estimated Time**: 5–6 days  
**Demo Talking Point**: *"The platform detected SSH Port 22 exposed globally. I clicked Auto-Fix — it revoked the rule and applied a restricted CIDR in under 2 seconds."*

---

### Feature 2.2 — Natural Language AWS Querying (Text-to-AWS)

**What it does**: Users type plain English → Bedrock decides which AWS API to call → backend executes boto3 → real data returned as natural language.

**Examples**:
- *"How many EC2 instances are stopped?"* → Calls `ec2.describe_instances()` → *"You have 2 stopped instances: t3.micro and t3.large"*
- *"Which S3 buckets don't have encryption?"* → Filters live S3 data → real bucket names
- *"What is my most expensive service this month?"* → Cost Explorer → real answer

**Why it matters**: This is **LLM tool use / function calling** — the core architecture behind ChatGPT plugins and Claude tools.

#### Architecture (ReAct Pattern)
```
User Question
     ↓
Bedrock (with tool definitions) — decides which AWS action to call
     ↓
Backend executes real boto3 API call
     ↓
Raw data returned to Bedrock
     ↓
Natural language answer with real numbers
```

#### Backend Changes
```
backend/app/
  ai/
    tool_executor.py        [NEW] — maps tool names → boto3 functions
    nl_query.py             [NEW] — ReAct loop: Bedrock → tool → Bedrock
  api/
    copilot.py              [MODIFY] — add /copilot/query endpoint
```

#### Frontend Changes
```
frontend/src/
  app/
    copilot/page.tsx        [MODIFY] — add "Query Mode" toggle
  components/
    QueryResult.tsx         [NEW] — renders structured AWS data results inline
```

#### Implementation Steps
- [ ] Define 8–10 tool schemas for Bedrock: `list_ec2`, `list_s3`, `get_cost`, `list_lambda`, etc.
- [ ] Build `ToolExecutor` mapping tool names → boto3 service methods
- [ ] Implement ReAct loop: invoke → parse tool call → execute → send result back → final response
- [ ] Add Query mode in Copilot UI with data table rendering
- [ ] Add suggested example queries below the input

**Estimated Time**: 5–7 days  
**Demo Talking Point**: *"I asked in plain English: 'Which Lambda functions cost the most?' — it called AWS itself, fetched real data, and answered naturally."*

---

## 📊 Phase 3: Cloud Intelligence (Week 5–6)

### Feature 3.1 — AWS Well-Architected Compliance Scorecard

**What it does**: Automatically scores your AWS account against the **5 AWS Well-Architected Framework pillars**.

| Pillar | Score | Sample Findings |
|--------|-------|-----------------|
| 🔒 Security | 55/100 | 2 critical SG issues, unencrypted S3 |
| 💰 Cost Optimization | 70/100 | 2 stopped EC2, 3 gp2 volumes |
| ⚡ Performance Efficiency | 65/100 | Over-provisioned Lambda memory |
| 🔁 Reliability | 80/100 | RDS missing Multi-AZ |
| 🛠️ Operational Excellence | 60/100 | No lifecycle rules on S3 |

**Why it matters**: This maps directly to AWS certifications and AWS Trusted Advisor. Evaluators will immediately recognize the depth.

#### Backend Changes
```
backend/app/
  services/
    compliance_service.py   [NEW] — maps findings → 5 pillar scores
  api/
    dashboard.py            [MODIFY] — include compliance_scores in response
```

#### Frontend Changes
```
frontend/src/
  app/
    compliance/page.tsx     [NEW ROUTE] — full compliance report page
  components/
    ComplianceScoreCard.tsx [NEW] — 5-pillar radar chart + table
    PillarDetails.tsx       [NEW] — expandable finding list per pillar
```

#### Implementation Steps
- [ ] Map existing analyzer findings → 5 pillars
- [ ] Add 10–15 new lightweight checks (Multi-AZ, S3 versioning, CloudTrail, MFA, etc.)
- [ ] Build `ComplianceService.score()` → `{pillar, score, findings[], pass_count, fail_count}`
- [ ] Render radar/spider chart showing all 5 pillar scores
- [ ] Add compliance page to sidebar navigation

**Estimated Time**: 3–4 days  
**Demo Talking Point**: *"The platform runs 30+ checks mapped to the AWS Well-Architected Framework — the same framework AWS uses for enterprise architecture reviews."*

---

### Feature 3.2 — Resource Dependency Graph

**What it does**: Interactive network graph where nodes = AWS resources, edges = relationships between them.

**Example connections**:
- `EC2 (i-0abc)` → `Security Group (sg-0xyz)` → `VPC (vpc-0def)`
- `Lambda (ProcessOrders)` → `S3 Bucket (orders-raw)` [trigger]
- `RDS (prod-db)` → `Security Group (db-sg)`
- `EC2 (i-0abc)` → `EBS Volume (vol-0ghi)`

**Why it matters**: Visual infrastructure mapping is complex to build and extremely impressive to demo. Nobody else will have this.

#### Tech Stack
- `react-flow` — interactive node-edge graph with drag/zoom
- `dagre` — automatic graph layout algorithm

#### Backend Changes
```
backend/app/
  aws/
    relationships.py        [NEW] — builds resource graph from boto3 calls
  api/
    graph.py                [NEW] — GET /graph endpoint → {nodes, edges}
```

#### Frontend Changes
```
frontend/src/
  app/
    graph/page.tsx          [NEW ROUTE] — full-page dependency graph
  components/
    ResourceGraph.tsx       [NEW] — react-flow graph renderer
    ResourceNode.tsx        [NEW] — custom node with icon + status badge
```

#### Implementation Steps
- [ ] `npm install reactflow dagre` in frontend
- [ ] Build `RelationshipService.build_graph()` using: `describe_instances`, `describe_volumes`, `list_event_source_mappings`, `describe_db_instances`
- [ ] Return `{nodes: [{id, type, label}], edges: [{source, target, label}]}`
- [ ] Render with React Flow: color nodes by service type, show status badges
- [ ] Click any node → right panel shows resource details + recommendations

**Estimated Time**: 5–6 days  
**Demo Talking Point**: *"This dependency graph was built live from our AWS account. Click any node to see its security findings and recommendations."*

---

### Feature 3.3 — Resource Waste Heatmap (FinOps)

**What it does**: Treemap visualization where boxes = AWS services, size = monthly spend, color = efficiency (green = efficient, red = wasteful).

#### Frontend Changes
```
frontend/src/
  app/
    cost/page.tsx           [MODIFY] — add heatmap section
  components/
    WasteHeatmap.tsx        [NEW] — recharts Treemap component
```

#### Implementation Steps
- [ ] Compute per-service waste scores in `dashboard_service.py`
- [ ] Build treemap: `score < 30` = red, `30–70` = yellow, `> 70` = green
- [ ] Hover tooltip: service name, monthly cost, waste score, top finding

**Estimated Time**: 2–3 days  

---

## 🎤 Phase 4: Next-Level Copilot (Week 7–8)

### Feature 4.1 — Voice-Activated AWS Copilot

**What it does**: Mic button → speak question → transcribed → sent to Copilot → AI response read aloud.  
Uses browser's built-in **Web Speech API** — zero backend changes needed.

#### Frontend Changes
```
frontend/src/
  app/
    copilot/page.tsx        [MODIFY] — add mic button + voice state
  components/
    VoiceCopilot.tsx        [NEW] — mic button, waveform animation, TTS
```

#### Implementation Steps
- [ ] Add mic button with animated waveform while listening
- [ ] `window.SpeechRecognition` → on result → auto-fill input + submit
- [ ] `window.SpeechSynthesis.speak()` reads AI response aloud
- [ ] Add visual "Listening…" / "Speaking…" states

**Estimated Time**: 1 day  
**Demo Talking Point**: *"I can even ask by voice — the Copilot listens, queries live AWS data, and reads the answer back."*

---

### Feature 4.2 — AI Architecture Diagram Generator

**What it does**: User describes what they want to build → AI generates visual architecture diagram + Terraform code + cost estimate.

> Input: *"I need a scalable REST API with DynamoDB behind a CloudFront CDN"*  
> Output: Visual diagram + full Terraform HCL + estimated monthly cost

#### Backend Changes
```
backend/app/
  ai/
    architect.py            [NEW] — Bedrock prompt → structured diagram JSON
  api/
    architect.py            [NEW] — POST /architect/generate
```

#### Frontend Changes
```
frontend/src/
  app/
    architect/page.tsx      [NEW ROUTE] — input + diagram + terraform output
  components/
    ArchitectureCanvas.tsx  [NEW] — react-flow diagram renderer
    TerraformOutput.tsx     [NEW] — syntax-highlighted HCL code panel
    CostEstimate.tsx        [NEW] — estimated monthly cost breakdown card
```

#### Implementation Steps
- [ ] Bedrock prompt → structured JSON: `{components, connections, terraform, estimated_cost}`
- [ ] Parse components → React Flow nodes with AWS service icons
- [ ] Parse connections → React Flow edges with labels
- [ ] Syntax-highlighted Terraform code block (copy button)
- [ ] Cost breakdown table per service

**Estimated Time**: 5–6 days  
**Demo Talking Point**: *"I described what I want in one sentence. The AI designed the architecture, drew the diagram, wrote all the Terraform, and estimated it at $47/month."*

---

### Feature 4.3 — Multi-Agent AI Architecture *(Stretch Goal)*

**What it does**: A team of specialized AI agents coordinated by an Orchestrator.

| Agent | Specialization |
|-------|---------------|
| **Orchestrator** | Routes questions to the right specialist |
| **FinOps Agent** | Cost analysis, forecasting, budget recommendations |
| **Security Agent** | IAM audits, security groups, compliance |
| **Performance Agent** | CloudWatch, Lambda tuning, EC2 rightsizing |
| **IaC Agent** | Terraform generation, architecture review |

#### Implementation Steps
- [ ] Define each agent with its own system prompt + data access scope
- [ ] Build `AgentRouter` — analyzes question → picks specialist agent
- [ ] Show UI indicator of which agent is responding: `[FinOps Agent]`, `[Security Agent]`
- [ ] Log agent handoffs for transparency

**Estimated Time**: 1–2 weeks  

---

## 📅 Week-by-Week Calendar

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Anomaly Detection backend (ML model + API) | `/anomalies` endpoint working |
| **Week 2** | Anomaly frontend + Cost Forecasting | Alert banners + forecast chart live |
| **Week 3** | Auto-Remediation backend (boto3 fixes) | Fix logic for SEC-001, EBS-001, S3-001 |
| **Week 4** | Auto-Remediation frontend + NL Querying | "Auto-Fix" button + query mode in Copilot |
| **Week 5** | Well-Architected Compliance Scorecard | New `/compliance` page with radar chart |
| **Week 6** | Resource Dependency Graph | React Flow graph with live AWS data |
| **Week 7** | Waste Heatmap + Voice Copilot | FinOps treemap + mic button |
| **Week 8** | Architecture Diagram Generator + Polish | Architect page + demo preparation |

---

## 📚 New Dependencies to Install

### Backend (Python)
```bash
# Phase 1: Anomaly Detection & Forecasting
pip install scikit-learn pandas numpy

# Phase 1: Advanced cost forecasting (optional)
pip install prophet
```

### Frontend (Node)
```bash
# Phase 3: Dependency Graph
npm install reactflow dagre

# Phase 3: Heatmap / Charts
npm install recharts
```

---

## 🏆 What This Project Demonstrates

| AI / ML Concept | Feature |
|----------------|---------|
| Unsupervised ML (Isolation Forest) | Anomaly Detection |
| Time-Series Forecasting | Cost Forecasting |
| LLM Tool Use / Function Calling | NL AWS Querying |
| Multi-Agent AI Systems | Phase 4 Multi-Agent |
| Generative AI + Structured Output | Architecture Generator |
| Multimodal AI Interface | Voice Copilot |

| Cloud / DevOps Concept | Feature |
|-----------------------|---------|
| AIOps / Autonomous Remediation | One-Click Auto-Fix |
| FinOps / Cloud Financial Ops | Cost Forecasting + Waste Heatmap |
| Framework Compliance (AWS WAF) | Well-Architected Scorecard |
| Infrastructure Graph Theory | Resource Dependency Graph |
| Containerized Deployment | Already done ✅ |
| Serverless / Cloud-Native | Already done ✅ |

---

## 🎯 Minimum Viable Demo (If Time is Short)

If pressed for time, complete just these **3 features** for maximum evaluator impact:

1. ✅ **Anomaly Detection** — Real ML, visual, clear demo
2. ✅ **Auto-Remediation** — Live action, autonomous, unique
3. ✅ **Well-Architected Compliance Score** — Framework knowledge, professional

These 3 + your existing baseline = a **strong, distinct final year project** in the AI + Cloud space.

---

*Plan created: September 2026 | CloudOps AI v3.0 Enhancement Roadmap*
