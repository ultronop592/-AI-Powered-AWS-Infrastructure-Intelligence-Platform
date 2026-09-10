// src/lib/api.ts
// CloudOps AI — API library (v2.0)
// Session-based auth: raw AWS credentials are NEVER sent after initial verify.
// All subsequent requests use a server-issued session_token UUID.

export interface Summary {
  monthly_cost: number;
  currency: string;
  ec2_count: number;
  s3_bucket_count: number;
  security_health_score?: number;
  health_score?: number;
  rds_count?: number;
  lambda_count?: number;
  ebs_count?: number;
  gp3_monthly_savings?: number;
}

export interface CostItem {
  service: string;
  cost: number;
}

export interface EC2Instance {
  InstanceId: string;
  InstanceType: string;
  State: string;
  PublicIp?: string;
  PrivateIp?: string;
  Region?: string;
  LaunchTime?: string;
}

export interface S3Bucket {
  Name: string;
  CreationDate?: string;
  Region?: string;
  Encrypted?: boolean;
  PublicAccess?: boolean;
  Versioning?: boolean;
}

export interface SecurityRule {
  protocol: string;
  port: string;
  cidrs: string[];
  is_open_to_world: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string;
}

export interface SecurityGroup {
  GroupId: string;
  GroupName: string;
  VpcId: string;
  Description?: string;
  OpenPorts: string[];
  RiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  Rules: SecurityRule[];
}

export interface SecuritySummary {
  total_security_groups: number;
  critical_risk_count: number;
  high_risk_count: number;
  medium_risk_count?: number;
  total_open_ports: number;
  security_health_score: number;
  security_score?: number;
  open_critical_ports?: Array<{
    group_id: string;
    group_name: string;
    port: string;
    severity: string;
  }>;
  iam_guardrails?: {
    root_account_mfa: boolean;
    root_api_keys: boolean;
    unused_roles_count: number;
    overprivileged_policies: number;
  };
}

export interface S3SecuritySummary {
  total_buckets: number;
  public_bucket_count: number;
  unencrypted_bucket_count: number;
  unversioned_bucket_count: number;
  s3_violations: Array<{
    bucket: string;
    finding: string;
    severity: string;
  }>;
}

export interface EncryptionCompliance {
  encryption_issues_count: number;
  encryption_issues: Array<{
    resource: string;
    type: string;
    finding: string;
    severity: string;
  }>;
}

export interface RDSInstance {
  DBInstanceIdentifier: string;
  Engine: string;
  DBInstanceClass: string;
  Status: string;
  MultiAZ: boolean;
  AllocatedStorage: number;
  StorageType: string;
  Endpoint: string;
  Port: number;
  CPUUtilization: number;
  Connections: number;
}

export interface LambdaFunction {
  FunctionName: string;
  Runtime: string;
  MemorySize: number;
  CodeSize: number;
  LastModified?: string;
  AvgDurationMs: number;
  ColdStartMs: number;
  ErrorRatePercent: number;
  MemoryEfficiencyPercent: number;
}

export interface EBSVolume {
  VolumeId: string;
  SizeGB: number;
  VolumeType: string;
  State: string;
  AttachedInstance: string;
  GP3Eligible: boolean;
  MonthlySavingsUSD: number;
}

export interface ECSCluster {
  ClusterName: string;
  Status: string;
  RunningTasksCount: number;
  PendingTasksCount: number;
  ActiveServicesCount: number;
  RegisteredContainerInstancesCount: number;
}

export interface DeepSummary {
  total_rds_count: number;
  multi_az_rds_count: number;
  unattached_rds_snapshots: number;
  total_lambda_count: number;
  overprovisioned_lambda_count: number;
  total_ebs_count: number;
  gp2_migration_count: number;
  gp3_monthly_savings: number;
  unattached_ebs_count: number;
  total_ecs_clusters: number;
  total_ecs_running_tasks: number;
}

export interface MetricSeries {
  label: string;
  values: number[];
  unit: string;
}

export interface CloudWatchMetrics {
  instance_id: string;
  timestamps: string[];
  cpu: MetricSeries;
  ram: MetricSeries;
  net_in: MetricSeries;
  net_out: MetricSeries;
  disk_io: MetricSeries;
}

export interface Recommendation {
  id?: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  category?: string;
  title?: string;
  description?: string;
  action?: string;
  type?: string;
}

export interface AIReport {
  health_score?: number;
  security_score?: number;
  executive_summary?: string;
  priority_actions?: string[];
  estimated_savings?: string;
  terraform_remediation?: string;
  // Legacy fields (kept for backward compat)
  cost_optimization?: string;
}

export interface ComplianceCheck {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  description: string;
  remediation: string;
}

export interface PillarCompliance {
  name: string;
  icon: string;
  score: number;
  status: 'Good' | 'Needs Attention' | 'Critical' | string;
  total_checks: number;
  pass_count: number;
  warning_count: number;
  fail_count: number;
  checks: ComplianceCheck[];
}

export interface ComplianceReport {
  overall_score: number;
  status: string;
  evaluated_at: string;
  region: string;
  total_checks: number;
  total_passed: number;
  total_warning: number;
  total_failed: number;
  pillars: {
    security: PillarCompliance;
    cost_optimization: PillarCompliance;
    reliability: PillarCompliance;
    performance_efficiency: PillarCompliance;
    operational_excellence: PillarCompliance;
  };
}

export interface GraphNodeData {
  id: string;
  type: string;
  label: string;
  name: string;
  service: string;
  status: string;
  risk_level: string;
  findings_count: number;
  details: Record<string, any>;
  [key: string]: unknown;
}

export interface GraphNode {
  id: string;
  type: string;
  label?: string;
  name?: string;
  service?: string;
  status?: string;
  risk_level?: string;
  findings_count?: number;
  details?: Record<string, any>;
  position: { x: number; y: number };
  data?: GraphNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface ResourceGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    total_nodes: number;
    total_edges: number;
    by_service: Record<string, number>;
  };
  region: string;
  is_demo: boolean;
}

export interface ServiceWasteItem {
  service: string;
  cost: number;
  efficiency_score: number;
  waste_score: number;
  status: 'Efficient' | 'Warning' | 'Wasteful' | string;
  top_finding: string;
  potential_savings: number;
}

export interface DashboardResponse {
  summary: Summary;
  cost_by_service: CostItem[];
  ec2: EC2Instance[];
  s3: S3Bucket[];
  security_groups?: SecurityGroup[];
  security_summary?: SecuritySummary;
  s3_security?: S3SecuritySummary;
  encryption_compliance?: EncryptionCompliance;
  rds?: RDSInstance[];
  lambdas?: LambdaFunction[];
  ebs?: EBSVolume[];
  ecs?: ECSCluster[];
  deep_summary?: DeepSummary;
  cloudwatch_metrics?: CloudWatchMetrics;
  recommendations: Recommendation[];
  ai_report: AIReport | string;
  compliance?: ComplianceReport;
  waste_analysis?: ServiceWasteItem[];
  is_mock?: boolean;
  is_demo?: boolean;
  fetched_at?: string;
  aws_fetch_ms?: number;
  cache_hit?: boolean;
}

export interface AWSCredentials {
  access_key: string;
  secret_key: string;
  region: string;
  account_id?: string;
  arn?: string;
}

// Session info stored in localStorage (NO raw credentials)
export interface AWSSession {
  session_token: string;
  account_id: string;
  arn: string;
  region: string;
  connected_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  mode?: 'chat' | 'terraform';
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function formatDateString(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Session token storage (replaces raw credential storage)
// ---------------------------------------------------------------------------

export function getActiveSession(): AWSSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('cloudops_session');
    if (!saved) return null;
    return JSON.parse(saved) as AWSSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AWSSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cloudops_session', JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cloudops_session');
}

export function isSessionActive(): boolean {
  return getActiveSession() !== null;
}

// ---------------------------------------------------------------------------
// Legacy compatibility helpers — kept so existing components don't break
// ---------------------------------------------------------------------------

/** @deprecated Use getActiveSession() — returns legacy-shaped object */
export function getSavedAWSCredentials(): AWSCredentials | null {
  const sess = getActiveSession();
  if (!sess) return null;
  return {
    access_key: '***', // never stored
    secret_key: '***', // never stored
    region: sess.region,
    account_id: sess.account_id,
    arn: sess.arn,
  };
}

/** @deprecated Use saveSession() */
export function saveAWSCredentials(_creds: AWSCredentials): void {
  // No-op: credentials are not stored client-side in v2
}

/** @deprecated Use clearSession() */
export function clearAWSCredentials(): void {
  clearSession();
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function verifyAWSCredentials(
  creds: AWSCredentials
): Promise<{ valid: boolean; session_token?: string; account_id?: string; arn?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/aws/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: creds.access_key,
        secret_key: creds.secret_key,
        region: creds.region,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errData = await res.json().catch(() => ({}));
      return { valid: false, message: errData.detail || 'AWS Verification Failed.' };
    }
  } catch {
    return { valid: false, message: 'Could not connect to FastAPI server.' };
  }
}

export async function disconnectSession(): Promise<void> {
  const session = getActiveSession();
  if (!session) return;

  try {
    await fetch(`${API_BASE_URL}/aws/session`, {
      method: 'DELETE',
      headers: {
        'X-Session-Token': session.session_token,
      },
    });
  } catch {
    // Best-effort; local session cleared regardless
  } finally {
    clearSession();
  }
}

// ---------------------------------------------------------------------------
// Dashboard mock data (used in demo mode and as fallback)
// ---------------------------------------------------------------------------

export const MOCK_CLOUDWATCH_METRICS: CloudWatchMetrics = {
  instance_id: 'i-0a123456789abcdef',
  timestamps: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  cpu: { label: 'CPU Utilization (%)', values: [12.4, 11.2, 9.8, 14.5, 28.6, 42.1, 48.5, 52.3, 44.8, 38.2, 29.5, 18.2], unit: '%' },
  ram: { label: 'Memory Utilization (%)', values: [32.1, 32.5, 31.8, 34.0, 48.2, 62.5, 68.4, 71.2, 65.0, 58.4, 45.2, 38.0], unit: '%' },
  net_in: { label: 'Network In (MB)', values: [14.2, 12.8, 10.5, 18.2, 45.6, 92.4, 110.5, 128.4, 98.2, 75.4, 52.1, 28.4], unit: 'MB' },
  net_out: { label: 'Network Out (MB)', values: [28.4, 25.6, 21.0, 36.4, 91.2, 184.8, 221.0, 256.8, 196.4, 150.8, 104.2, 56.8], unit: 'MB' },
  disk_io: { label: 'Disk Read/Write (MB/s)', values: [4.2, 3.8, 3.1, 5.4, 14.2, 28.5, 35.2, 42.1, 31.4, 24.8, 16.2, 9.1], unit: 'MB/s' },
};

export const MOCK_SECURITY_GROUPS: SecurityGroup[] = [
  {
    GroupId: 'sg-0a8b1c2d3e4f5a6b7',
    GroupName: 'cloudops-web-public-sg',
    VpcId: 'vpc-0123456789abcdef0',
    Description: 'Public web server security group',
    OpenPorts: ['Port 22 (SSH)', 'Port 23 (Telnet)'],
    RiskLevel: 'CRITICAL',
    Rules: [
      { protocol: 'tcp', port: '22', cidrs: ['0.0.0.0/0'], is_open_to_world: true, severity: 'CRITICAL' },
      { protocol: 'tcp', port: '80', cidrs: ['0.0.0.0/0'], is_open_to_world: true, severity: 'INFO' },
      { protocol: 'tcp', port: '443', cidrs: ['0.0.0.0/0'], is_open_to_world: true, severity: 'INFO' },
      { protocol: 'tcp', port: '23', cidrs: ['0.0.0.0/0'], is_open_to_world: true, severity: 'MEDIUM' },
    ],
  },
];

export const MOCK_SECURITY_SUMMARY: SecuritySummary = {
  total_security_groups: 3,
  critical_risk_count: 1,
  high_risk_count: 1,
  medium_risk_count: 1,
  total_open_ports: 3,
  security_health_score: 65,
  security_score: 65,
  open_critical_ports: [
    { group_id: 'sg-0a8b1c2d3e4f5a6b7', group_name: 'cloudops-web-public-sg', port: '22', severity: 'CRITICAL' },
  ],
};

export const MOCK_RDS_INSTANCES: RDSInstance[] = [
  {
    DBInstanceIdentifier: 'cloudops-db-prod-postgres',
    Engine: 'postgres 15.4',
    DBInstanceClass: 'db.t3.medium',
    Status: 'available',
    MultiAZ: true,
    AllocatedStorage: 100,
    StorageType: 'gp2',
    Endpoint: 'cloudops-db-prod.c123456789.us-east-1.rds.amazonaws.com',
    Port: 5432,
    CPUUtilization: 18.4,
    Connections: 14,
  },
];

export const MOCK_LAMBDA_FUNCTIONS: LambdaFunction[] = [
  {
    FunctionName: 'cloudops-report-generator',
    Runtime: 'python3.12',
    MemorySize: 1024,
    CodeSize: 4.85,
    LastModified: '2026-07-20T14:30:00Z',
    AvgDurationMs: 185,
    ColdStartMs: 340,
    ErrorRatePercent: 0.0,
    MemoryEfficiencyPercent: 18.2,
  },
];

export const MOCK_EBS_VOLUMES: EBSVolume[] = [
  {
    VolumeId: 'vol-0a1b2c3d4e5f6g7h8',
    SizeGB: 200,
    VolumeType: 'gp2',
    State: 'in-use',
    AttachedInstance: 'i-0a123456789abcdef',
    GP3Eligible: true,
    MonthlySavingsUSD: 4.00,
  },
];

export const MOCK_ECS_CLUSTERS: ECSCluster[] = [
  {
    ClusterName: 'cloudops-production-ecs-cluster',
    Status: 'ACTIVE',
    RunningTasksCount: 4,
    PendingTasksCount: 0,
    ActiveServicesCount: 2,
    RegisteredContainerInstancesCount: 2,
  },
];

export const MOCK_DEEP_SUMMARY: DeepSummary = {
  total_rds_count: 2,
  multi_az_rds_count: 1,
  unattached_rds_snapshots: 1,
  total_lambda_count: 3,
  overprovisioned_lambda_count: 1,
  total_ebs_count: 3,
  gp2_migration_count: 3,
  gp3_monthly_savings: 7.00,
  unattached_ebs_count: 1,
  total_ecs_clusters: 1,
  total_ecs_running_tasks: 4,
};

export const MOCK_DASHBOARD: DashboardResponse = {
  summary: {
    monthly_cost: 14.67,
    currency: 'USD',
    ec2_count: 2,
    s3_bucket_count: 3,
    security_health_score: 65,
    health_score: 71,
    rds_count: 2,
    lambda_count: 3,
    ebs_count: 3,
    gp3_monthly_savings: 7.00,
  },
  cost_by_service: [
    { service: 'Amazon EC2', cost: 10.32 },
    { service: 'Amazon S3', cost: 1.74 },
    { service: 'AWS Key Management Service', cost: 1.15 },
    { service: 'Amazon CloudWatch', cost: 0.86 },
    { service: 'AWS CloudTrail', cost: 0.60 },
  ],
  ec2: [
    {
      InstanceId: 'i-0a123456789abcdef',
      InstanceType: 't3.micro',
      State: 'running',
      PublicIp: '54.210.12.98',
      PrivateIp: '172.31.16.4',
      Region: 'us-east-1',
      LaunchTime: '2026-07-01T10:00:00Z',
    },
    {
      InstanceId: 'i-0b987654321fedcba',
      InstanceType: 't2.medium',
      State: 'stopped',
      PublicIp: 'N/A',
      PrivateIp: '172.31.24.18',
      Region: 'us-east-1',
      LaunchTime: '2026-06-15T08:30:00Z',
    },
  ],
  s3: [
    { Name: 'cloudops-logs-prod-useast1', CreationDate: '2026-05-10T14:22:00Z', Region: 'us-east-1', Encrypted: true, PublicAccess: false, Versioning: true },
    { Name: 'cloudops-assets-public', CreationDate: '2026-05-12T09:15:00Z', Region: 'us-east-1', Encrypted: true, PublicAccess: false, Versioning: false },
    { Name: 'cloudops-backups-archive', CreationDate: '2026-06-01T07:00:00Z', Region: 'us-west-2', Encrypted: false, PublicAccess: false, Versioning: false },
  ],
  security_groups: MOCK_SECURITY_GROUPS,
  security_summary: MOCK_SECURITY_SUMMARY,
  s3_security: {
    total_buckets: 3,
    public_bucket_count: 0,
    unencrypted_bucket_count: 1,
    unversioned_bucket_count: 2,
    s3_violations: [
      { bucket: 'cloudops-backups-archive', finding: 'No default encryption configured', severity: 'HIGH' },
    ],
  },
  rds: MOCK_RDS_INSTANCES,
  lambdas: MOCK_LAMBDA_FUNCTIONS,
  ebs: MOCK_EBS_VOLUMES,
  ecs: MOCK_ECS_CLUSTERS,
  deep_summary: MOCK_DEEP_SUMMARY,
  cloudwatch_metrics: MOCK_CLOUDWATCH_METRICS,
  recommendations: [
    {
      id: 'EBS-001',
      severity: 'MEDIUM',
      category: 'EBS Storage Optimization',
      title: 'Migrate Legacy EBS gp2 Volumes to gp3',
      description: '3 legacy gp2 EBS volumes identified. Migrating to gp3 provides 20% lower cost per GB with baseline 3000 IOPS.',
      action: 'Convert volume type from gp2 to gp3 to save estimated ~$7.00/month instantly.',
    },
    {
      id: 'SEC-001',
      severity: 'HIGH',
      category: 'Security Guardrails',
      title: 'CRITICAL: Publicly Exposed Management Port (SSH/RDP)',
      description: 'Security Group sg-0a8b1c2d3e4f5a6b7 allows unrestricted 0.0.0.0/0 inbound access on Port 22 (SSH).',
      action: 'Restrict inbound SSH access to trusted admin IP CIDRs or use AWS Systems Manager Session Manager.',
    },
    {
      id: 'S3-001',
      severity: 'HIGH',
      category: 'S3 Security',
      title: 'Unencrypted S3 Bucket Detected',
      description: 'Bucket cloudops-backups-archive has no default encryption configured.',
      action: 'Enable S3 Default Encryption (SSE-S3 or SSE-KMS) on all buckets.',
    },
  ],
  ai_report: {
    health_score: 71,
    security_score: 65,
    executive_summary:
      'Your AWS environment has a Cloud Health Score of 71/100 with a security posture of 65/100 requiring immediate attention. ' +
      'Critical: Security Group sg-0a8b1c2d3e4f5a6b7 exposes SSH (Port 22) and Telnet (Port 23) to 0.0.0.0/0. ' +
      'Estimated savings of $12.40/month are achievable through EBS gp3 migration and idle EC2 cleanup.',
    priority_actions: [
      'Restrict SSH Port 22 to trusted admin IP CIDR — eliminate CRITICAL security exposure immediately',
      'Migrate 3 EBS gp2 volumes to gp3 — save $7.00/month (20% storage cost reduction)',
      'Terminate stopped EC2 instance i-0b987654321fedcba — save ~$5.40/month in EBS charges',
    ],
    estimated_savings: '$12.40/month (54.2% reduction)',
    terraform_remediation:
      '```hcl\nprovider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_security_group_rule" "restrict_ssh" {\n  type              = "ingress"\n  from_port         = 22\n  to_port           = 22\n  protocol          = "tcp"\n  cidr_blocks       = ["203.0.113.50/32"]\n  security_group_id = "sg-0a8b1c2d3e4f5a6b7"\n}\n```',
  },
  compliance: {
    overall_score: 55,
    status: 'Critical Risk',
    evaluated_at: new Date().toISOString(),
    region: 'us-east-1',
    total_checks: 26,
    total_passed: 14,
    total_warning: 4,
    total_failed: 8,
    pillars: {
      security: {
        name: 'Security',
        icon: '🔒',
        score: 50,
        status: 'Critical',
        total_checks: 6,
        pass_count: 3,
        warning_count: 0,
        fail_count: 3,
        checks: [
          { id: 'SEC-01', name: 'Restricted Management Ingress (SSH/RDP)', status: 'FAIL', severity: 'CRITICAL', description: 'Public 0.0.0.0/0 ingress detected on administrative port(s) in sg-0a8b1c2d3e4f5a6b7.', remediation: 'Restrict Port 22/3389 rules to specific trusted corporate /32 CIDRs or replace with AWS Systems Manager.' },
          { id: 'SEC-02', name: 'Database Ingress Isolation', status: 'FAIL', severity: 'HIGH', description: '1 security group rule(s) expose database listener ports to 0.0.0.0/0.', remediation: 'Restrict database ingress to private application VPC subnets (e.g. 172.31.0.0/16).' },
          { id: 'SEC-03', name: 'S3 Bucket Default Encryption', status: 'FAIL', severity: 'HIGH', description: '1 S3 bucket(s) do not enforce default server-side encryption.', remediation: 'Enable default encryption using AES-256 (SSE-S3) or AWS KMS customer-managed keys.' },
          { id: 'SEC-04', name: 'S3 Public Access Block Enforced', status: 'PASS', severity: 'CRITICAL', description: 'All S3 buckets have Block Public Access configurations active at account or bucket level.', remediation: 'Ensure account-level S3 Public Access Block remains turned on.' },
          { id: 'SEC-05', name: 'EBS Volume Data-at-Rest Encryption', status: 'PASS', severity: 'MEDIUM', description: 'All attached and standalone EBS volumes are encrypted using AWS KMS or default keys.', remediation: 'Enable account-level default EBS encryption in EC2 settings for the target region.' },
          { id: 'SEC-06', name: 'IAM Root Account Protection', status: 'PASS', severity: 'CRITICAL', description: 'Root account has hardware or virtual MFA enabled with zero active access keys.', remediation: 'Maintain least-privilege IAM roles and avoid using the AWS root account for daily operations.' },
        ],
      },
      cost_optimization: {
        name: 'Cost Optimization',
        icon: '💰',
        score: 30,
        status: 'Critical',
        total_checks: 5,
        pass_count: 1,
        warning_count: 1,
        fail_count: 3,
        checks: [
          { id: 'COST-01', name: 'Idle Compute Reclamation', status: 'FAIL', severity: 'HIGH', description: '1 stopped EC2 instance(s) detected still incurring EBS storage costs.', remediation: 'Terminate stopped instances if decommissioned, or snapshot and detach attached EBS volumes.' },
          { id: 'COST-02', name: 'EBS Modernization (gp2 -> gp3)', status: 'FAIL', severity: 'MEDIUM', description: '3 legacy gp2 volume(s) found. Upgrading to gp3 yields ~20% immediate savings.', remediation: 'Modify volume types from gp2 to gp3 online without downtime to save ~$7.00/month.' },
          { id: 'COST-03', name: 'Orphaned Storage Hygiene', status: 'FAIL', severity: 'HIGH', description: '1 orphaned EBS volume(s) in "available" state consuming unallocated storage budget.', remediation: 'Take snapshots if data retention is required, then delete orphaned volumes.' },
          { id: 'COST-04', name: 'Serverless Memory Right-Sizing', status: 'WARNING', severity: 'MEDIUM', description: '1 Lambda function(s) allocated 1024MB+ with <35% average memory utilization.', remediation: 'Reduce configured memory size to 256MB or 512MB to lower invocation GB-second billing costs.' },
          { id: 'COST-05', name: 'Budget Governance & Forecast', status: 'PASS', severity: 'LOW', description: 'Month-to-date spending ($14.67) is within controlled standard operating thresholds.', remediation: 'Configure AWS Budgets alerts to trigger email/Slack notifications at 80% and 100% of forecast.' },
        ],
      },
      reliability: {
        name: 'Reliability',
        icon: '🔁',
        score: 60,
        status: 'Needs Attention',
        total_checks: 5,
        pass_count: 3,
        warning_count: 1,
        fail_count: 1,
        checks: [
          { id: 'REL-01', name: 'Database High Availability (Multi-AZ)', status: 'FAIL', severity: 'HIGH', description: 'RDS instance(s) cloudops-postgres-prod operate as Single-AZ without synchronous standby failover.', remediation: 'Enable Multi-AZ deployment on production databases to withstand AZ degradation.' },
          { id: 'REL-02', name: 'S3 Versioning for Disaster Recovery', status: 'WARNING', severity: 'MEDIUM', description: '1 S3 bucket(s) lack versioning, exposing objects to accidental deletion.', remediation: 'Enable Versioning in S3 bucket properties to retain historical object versions.' },
          { id: 'REL-03', name: 'Compute Availability Redundancy', status: 'PASS', severity: 'HIGH', description: 'Workload compute architecture avoids single points of failure with redundant instances.', remediation: 'Leverage AWS Auto Scaling Groups (ASG) spanned across at least two Availability Zones.' },
          { id: 'REL-04', name: 'ECS Container Task Redundancy', status: 'PASS', severity: 'MEDIUM', description: 'ECS container services maintain at least 2 running tasks for zero-downtime rolling updates.', remediation: 'Verify ECS service minimum healthy percent is set to 100% during task deployments.' },
          { id: 'REL-05', name: 'CloudWatch Health Telemetry', status: 'PASS', severity: 'LOW', description: 'Compute infrastructure is actively reporting CloudWatch metric streams.', remediation: 'Ensure SNS alerting topics are wired to CloudWatch high CPU and memory alarms.' },
        ],
      },
      performance_efficiency: {
        name: 'Performance Efficiency',
        icon: '⚡',
        score: 70,
        status: 'Needs Attention',
        total_checks: 5,
        pass_count: 3,
        warning_count: 1,
        fail_count: 1,
        checks: [
          { id: 'PERF-01', name: 'Modern EC2 Processor Architecture', status: 'WARNING', severity: 'MEDIUM', description: 'Legacy generation EC2 instance(s) detected: i-0b987654321fedcba (t2.medium). Modern t3/t4g offer higher burst bandwidth.', remediation: 'Upgrade t2 instances to t3 or t4g (AWS Graviton) for improved Nitro performance.' },
          { id: 'PERF-02', name: 'EBS Volume IOPS Provisioning', status: 'FAIL', severity: 'MEDIUM', description: 'Older gp2 volumes couple IOPS to volume size, leading to unpredictable I/O throttling.', remediation: 'Migrate volumes to gp3 to decouple IOPS and throughput from disk volume capacity.' },
          { id: 'PERF-03', name: 'Lambda Execution Latency & Cold Starts', status: 'PASS', severity: 'LOW', description: 'Serverless functions demonstrate responsive execution times with minimal cold starts.', remediation: 'Enable Provisioned Concurrency for latency-critical user-facing API endpoints.' },
          { id: 'PERF-04', name: 'RDS Database Capacity & Load', status: 'PASS', severity: 'HIGH', description: 'Database instances maintain healthy CPU utilization (<80%) and stable connection pools.', remediation: 'Adopt Amazon RDS Proxy to pool connections and preserve database memory.' },
          { id: 'PERF-05', name: 'ECS Task Placement & Utilization', status: 'PASS', severity: 'LOW', description: 'Container services utilize AWS Fargate serverless compute with optimal task resource limits.', remediation: 'Review AWS CloudWatch Container Insights to verify CPU and memory reservation accuracy.' },
        ],
      },
      operational_excellence: {
        name: 'Operational Excellence',
        icon: '🛠️',
        score: 100,
        status: 'Good',
        total_checks: 5,
        pass_count: 5,
        warning_count: 0,
        fail_count: 0,
        checks: [
          { id: 'OPS-01', name: 'S3 Data Lifecycle Management', status: 'PASS', severity: 'MEDIUM', description: 'S3 buckets have automated retention policies or operate with optimized asset inventories.', remediation: 'Review non-current version expiration rules annually to comply with retention policies.' },
          { id: 'OPS-02', name: 'Serverless Runtime Currency', status: 'PASS', severity: 'HIGH', description: 'All Lambda functions execute on actively supported runtime environments.', remediation: 'Set up automated GitHub Actions or CI/CD pipelines to validate target language runtimes.' },
          { id: 'OPS-03', name: 'Infrastructure Tagging Hygiene', status: 'PASS', severity: 'MEDIUM', description: 'Standardized metadata tags (Environment, Project, ManagedBy) applied across cloud resources.', remediation: 'Enforce AWS Tag Policies with AWS Organizations to prevent untagged resource provisioning.' },
          { id: 'OPS-04', name: 'Centralized Log Aggregation', status: 'PASS', severity: 'MEDIUM', description: 'AWS CloudWatch and CloudTrail log streams are active for security and operations auditing.', remediation: 'Configure CloudWatch Log metric filters to alert on unauthorized API calls or root logins.' },
          { id: 'OPS-05', name: 'Infrastructure-as-Code (IaC) Alignment', status: 'PASS', severity: 'LOW', description: 'CloudOps AI Copilot generates verified Terraform HCL remediation modules for findings.', remediation: 'Store generated .tf remediation code in a version-controlled Git repository with CI/CD plan checks.' },
        ],
      },
    },
  },
  waste_analysis: [
    { service: 'Amazon Elastic Block Store', cost: 35.00, efficiency_score: 25, waste_score: 75, status: 'Wasteful', top_finding: '1 orphaned unattached volume and 3 legacy gp2 volumes found.', potential_savings: 7.00 },
    { service: 'Amazon EC2', cost: 10.32, efficiency_score: 50, waste_score: 50, status: 'Warning', top_finding: '1 stopped EC2 instance still incurring idle EBS storage charges.', potential_savings: 5.40 },
    { service: 'Amazon S3', cost: 1.74, efficiency_score: 60, waste_score: 40, status: 'Warning', top_finding: 'No automated S3 Glacier lifecycle archival configured on non-current objects.', potential_savings: 0.45 },
    { service: 'AWS Key Management Service', cost: 1.15, efficiency_score: 92, waste_score: 8, status: 'Efficient', top_finding: 'Customer Managed Keys (CMK) actively encrypting data without orphaned keys.', potential_savings: 0.00 },
    { service: 'Amazon CloudWatch', cost: 0.86, efficiency_score: 85, waste_score: 15, status: 'Efficient', top_finding: 'Log retention and metric collection operational within standard thresholds.', potential_savings: 0.00 },
    { service: 'AWS CloudTrail', cost: 0.60, efficiency_score: 95, waste_score: 5, status: 'Efficient', top_finding: 'Management event trail recording across regions without redundant duplication.', potential_savings: 0.00 },
  ],
  is_mock: true,
  is_demo: true,
  fetched_at: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Dashboard API fetch
// ---------------------------------------------------------------------------

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const session = getActiveSession();
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (session?.session_token) {
    headers['X-Session-Token'] = session.session_token;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/`, {
      cache: 'no-store',
      headers,
    });

    if (!res.ok) {
      console.warn(`[CloudOps API] HTTP ${res.status} — falling back to mock data.`);
      return { ...MOCK_DASHBOARD, is_demo: !session, fetched_at: new Date().toISOString() };
    }

    const data = await res.json();
    return {
      ...data,
      is_demo: data.is_demo ?? !session,
      fetched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[CloudOps API] Network error — using local mock data:', error);
    return { ...MOCK_DASHBOARD, is_demo: !session, fetched_at: new Date().toISOString() };
  }
}

// ---------------------------------------------------------------------------
// Copilot API
// ---------------------------------------------------------------------------

export async function sendCopilotMessage(message: string, mode: 'chat' | 'terraform' = 'chat'): Promise<string> {
  const session = getActiveSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (session?.session_token) {
    headers['X-Session-Token'] = session.session_token;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/copilot/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, mode }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.reply || 'No response received from Copilot.';
    }
  } catch (err) {
    console.warn('[Copilot API] Network error, using offline fallback:', err);
  }

  // Local fallback
  const msgLower = message.toLowerCase();
  if (mode === 'terraform' || msgLower.includes('terraform') || msgLower.includes('sec-001') || msgLower.includes('ssh')) {
    return `Here is the **Terraform (HCL)** code to fix recommendation **SEC-001** (restricting open SSH Port 22 from \`0.0.0.0/0\`):

\`\`\`hcl
resource "aws_security_group_rule" "allow_ssh_admin_only" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["203.0.113.50/32"]
  security_group_id = "sg-0a8b1c2d3e4f5a6b7"
  description       = "Restricted SSH access for CloudOps admin"
}
\`\`\`

### Apply Steps:
1. Save as \`security.tf\`.
2. Run \`terraform plan\` to preview changes.
3. Run \`terraform apply\` to enforce restricted SSH access.`;
  }

  return `Hello! I am your **AWS CloudOps AI Copilot**.

I have analyzed your environment:
- **Monthly Spend**: $14.67 USD
- **Cloud Health Score**: 71/100
- **Security Score**: 65/100 (action required)
- **Potential Savings**: $12.40/mo (EBS gp3 + idle EC2 cleanup)

Ask me anything or click **"Generate Terraform"** to generate HCL remediation code!`;
}

// ---------------------------------------------------------------------------
// Backend health check
// ---------------------------------------------------------------------------

export async function checkBackendHealth(): Promise<{ status: string; project?: string; version?: string; is_online: boolean; active_sessions?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return { ...data, is_online: true };
    }
  } catch {
    // ignore
  }
  return { status: 'offline', is_online: false };
}

// ---------------------------------------------------------------------------
// Resource Dependency Graph Mock & Fetch API (Phase 3.2)
// ---------------------------------------------------------------------------

export const MOCK_RESOURCE_GRAPH: ResourceGraphResponse = {
  nodes: [
    { id: 'vpc-0123456789abcdef0', type: 'vpc', label: 'VPC: vpc-0123456789abcdef0', name: 'vpc-0123456789abcdef0', service: 'Amazon VPC', status: 'active', risk_level: 'LOW', findings_count: 0, details: { 'CIDR Block': '172.31.0.0/16', State: 'available', DefaultVPC: true }, position: { x: 50, y: 120 } },
    { id: 'sg-0a8b1c2d3e4f5a6b7', type: 'security_group', label: 'cloudops-web-public-sg', name: 'sg-0a8b1c2d3e4f5a6b7', service: 'Security Group', status: 'critical', risk_level: 'CRITICAL', findings_count: 2, details: { GroupId: 'sg-0a8b1c2d3e4f5a6b7', GroupName: 'cloudops-web-public-sg', OpenPorts: ['Port 22 (SSH)', 'Port 23 (Telnet)'], VpcId: 'vpc-0123456789abcdef0' }, position: { x: 380, y: 60 } },
    { id: 'sg-0f9e8d7c6b5a4f3e2', type: 'security_group', label: 'cloudops-database-sg', name: 'sg-0f9e8d7c6b5a4f3e2', service: 'Security Group', status: 'warning', risk_level: 'HIGH', findings_count: 1, details: { GroupId: 'sg-0f9e8d7c6b5a4f3e2', GroupName: 'cloudops-database-sg', OpenPorts: ['Port 3306 (MySQL)'], VpcId: 'vpc-0123456789abcdef0' }, position: { x: 380, y: 220 } },
    { id: 'i-0a123456789abcdef', type: 'ec2', label: 'i-0a123456789abcdef (t3.micro)', name: 'i-0a123456789abcdef', service: 'Amazon EC2', status: 'running', risk_level: 'LOW', findings_count: 0, details: { InstanceType: 't3.micro', PublicIp: '54.210.12.98', PrivateIp: '172.31.16.4', State: 'running', LaunchTime: '2026-07-01' }, position: { x: 720, y: 60 } },
    { id: 'i-0b987654321fedcba', type: 'ec2', label: 'i-0b987654321fedcba (t2.medium)', name: 'i-0b987654321fedcba', service: 'Amazon EC2', status: 'stopped', risk_level: 'HIGH', findings_count: 1, details: { InstanceType: 't2.medium', PublicIp: 'N/A', PrivateIp: '172.31.24.18', State: 'stopped', LaunchTime: '2026-06-15' }, position: { x: 720, y: 220 } },
    { id: 'cloudops-order-processor', type: 'lambda', label: 'λ cloudops-order-processor', name: 'cloudops-order-processor', service: 'AWS Lambda', status: 'active', risk_level: 'LOW', findings_count: 0, details: { Runtime: 'python3.11', MemorySize: '256 MB', AvgDuration: '145 ms', ColdStart: '380 ms' }, position: { x: 720, y: 380 } },
    { id: 'cloudops-thumbnail-generator', type: 'lambda', label: 'λ cloudops-thumbnail-generator', name: 'cloudops-thumbnail-generator', service: 'AWS Lambda', status: 'warning', risk_level: 'MEDIUM', findings_count: 1, details: { Runtime: 'python3.11', MemorySize: '1536 MB', AvgDuration: '820 ms', ColdStart: '1200 ms' }, position: { x: 720, y: 530 } },
    { id: 'vol-0a1b2c3d4e5f6a7b8', type: 'ebs', label: 'vol-0a1b2c3d4e5f6a7b8 (50GB gp2)', name: 'vol-0a1b2c3d4e5f6a7b8', service: 'Amazon EBS', status: 'warning', risk_level: 'MEDIUM', findings_count: 1, details: { SizeGB: 50, VolumeType: 'gp2', AttachedInstance: 'i-0a123456789abcdef', Encrypted: true, SavingsPotential: '$2.30/mo' }, position: { x: 1080, y: 60 } },
    { id: 'vol-0c3d4e5f6a7b8c9d0', type: 'ebs', label: 'vol-0c3d4e5f6a7b8c9d0 (200GB gp2)', name: 'vol-0c3d4e5f6a7b8c9d0', service: 'Amazon EBS', status: 'warning', risk_level: 'HIGH', findings_count: 1, details: { SizeGB: 200, VolumeType: 'gp2', AttachedInstance: 'Unattached', Encrypted: false, SavingsPotential: '$4.70/mo' }, position: { x: 1080, y: 200 } },
    { id: 'cloudops-postgres-prod', type: 'rds', label: 'RDS: cloudops-postgres-prod', name: 'cloudops-postgres-prod', service: 'Amazon RDS', status: 'warning', risk_level: 'MEDIUM', findings_count: 1, details: { Engine: 'postgres', Class: 'db.t3.micro', MultiAZ: false, Storage: '20 GB', CPUUtilization: '18%' }, position: { x: 1080, y: 340 } },
    { id: 'cloudops-logs-prod-useast1', type: 's3', label: 'S3: cloudops-logs-prod-useast1', name: 'cloudops-logs-prod-useast1', service: 'Amazon S3', status: 'active', risk_level: 'LOW', findings_count: 0, details: { Encrypted: true, PublicAccess: false, Versioning: true, Region: 'us-east-1' }, position: { x: 1080, y: 480 } },
    { id: 'cloudops-backups-archive', type: 's3', label: 'S3: cloudops-backups-archive', name: 'cloudops-backups-archive', service: 'Amazon S3', status: 'warning', risk_level: 'HIGH', findings_count: 1, details: { Encrypted: false, PublicAccess: false, Versioning: false, Region: 'us-east-1' }, position: { x: 1080, y: 620 } },
  ],
  edges: [
    { id: 'e-sg1-vpc', source: 'sg-0a8b1c2d3e4f5a6b7', target: 'vpc-0123456789abcdef0', label: 'in_vpc', animated: false, style: { stroke: '#8c44ad', strokeDasharray: '5,5' } },
    { id: 'e-sg2-vpc', source: 'sg-0f9e8d7c6b5a4f3e2', target: 'vpc-0123456789abcdef0', label: 'in_vpc', animated: false, style: { stroke: '#8c44ad', strokeDasharray: '5,5' } },
    { id: 'e-ec2-sg1', source: 'i-0a123456789abcdef', target: 'sg-0a8b1c2d3e4f5a6b7', label: 'secured_by', animated: true, style: { stroke: '#ec7211', strokeWidth: 2 } },
    { id: 'e-ec2-sg2', source: 'i-0b987654321fedcba', target: 'sg-0a8b1c2d3e4f5a6b7', label: 'secured_by', animated: false, style: { stroke: '#ec7211', strokeWidth: 2 } },
    { id: 'e-ec2-ebs1', source: 'i-0a123456789abcdef', target: 'vol-0a1b2c3d4e5f6a7b8', label: 'attached_disk', animated: false, style: { stroke: '#b06000', strokeWidth: 2 } },
    { id: 'e-rds-sg2', source: 'cloudops-postgres-prod', target: 'sg-0f9e8d7c6b5a4f3e2', label: 'db_firewall', animated: false, style: { stroke: '#0073bb', strokeDasharray: '4,4' } },
    { id: 'e-lambda-s3', source: 'cloudops-thumbnail-generator', target: 'cloudops-logs-prod-useast1', label: 's3_trigger', animated: true, style: { stroke: '#137333', strokeWidth: 2 } },
  ],
  summary: {
    total_nodes: 12,
    total_edges: 7,
    by_service: { 'VPC': 1, 'Security Groups': 2, 'EC2': 2, 'Lambda': 2, 'EBS': 2, 'RDS': 1, 'S3': 2 },
  },
  region: 'us-east-1',
  is_demo: true,
};

export async function fetchResourceGraph(): Promise<ResourceGraphResponse> {
  const session = getActiveSession();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (session?.session_token) {
    headers['X-Session-Token'] = session.session_token;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/graph/`, {
      headers,
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Fallback on network or offline error
  }
  return { ...MOCK_RESOURCE_GRAPH, is_demo: !session };
}

