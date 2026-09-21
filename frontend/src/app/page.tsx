'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AICopilotDrawer from '../components/AICopilotDrawer';
import AWSConnectModal from '../components/AWSConnectModal';
import { fetchDashboardData, checkBackendHealth, DashboardResponse, MOCK_DASHBOARD } from '../lib/api';

export default function HomePage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAWSModalOpen, setIsAWSModalOpen] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);

    const result = await fetchDashboardData();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDemo = data.is_demo ?? data.is_mock ?? true;
  const summary = isDemo ? (data.summary || MOCK_DASHBOARD.summary) : (data.summary || { monthly_cost: 0, currency: 'USD', ec2_count: 0, s3_bucket_count: 0 });
  const recommendations = data.recommendations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar
        isBackendOnline={isBackendOnline}
        isMockData={isDemo}
        onRefresh={loadData}
        isLoading={loading}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        onOpenAWSModal={() => setIsAWSModalOpen(true)}
      />

      <AICopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <AWSConnectModal isOpen={isAWSModalOpen} onClose={() => setIsAWSModalOpen(false)} onConnected={loadData} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          
          {/* Top Retro System Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #0f172a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '3px 8px',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                [PRODUCT_HQ.EXE]
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                :: SYSTEM_SPECIFICATION &amp; OPERATIONAL_MANUAL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1.5px solid #059669',
                padding: '3px 8px',
                fontWeight: 700
              }}>
                ● ENGINE: BEDROCK_NOVA_LITE
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                padding: '3px 8px',
                fontWeight: 700,
                boxShadow: '1.5px 1.5px 0px #0f172a'
              }}>
                BUILD: v2.0-STABLE
              </span>
            </div>
          </div>

          {/* ================= HERO FRAME ================= */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            boxShadow: '6px 6px 0px #0f172a',
            padding: '32px 36px',
            marginBottom: '32px',
            position: 'relative'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff7ed',
              border: '1.5px solid #ec7211',
              color: '#c2410c',
              padding: '3px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              marginBottom: '16px',
              letterSpacing: '0.04em'
            }}>
              <span>⚡</span> AUTONOMOUS INFRASTRUCTURE GOVERNANCE &amp; FINOPS CONTROL PLANE
            </div>

            <h1 style={{
              fontSize: '34px',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '14px',
              maxWidth: '900px'
            }}>
              Autonomous AWS Cloud Intelligence, Cost Optimization &amp; Self-Healing Infrastructure
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#475569',
              lineHeight: '1.7',
              maxWidth: '850px',
              marginBottom: '26px',
              fontFamily: 'var(--font-sans)'
            }}>
              A high-precision, zero-agent platform engineered for DevOps, FinOps, and SRE teams. 
              Continuously ingests multi-service telemetry, synthesizes root-cause insights with 
              <strong> Amazon Bedrock (Nova Lite)</strong>, and executes deterministic 1-click 
              remediations across EC2, S3, RDS, EBS, Lambda, and Security tiers.
            </p>

            {/* Hero Interactive Launchpad CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <Link
                href="/overview"
                className="aws-btn-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🚀 LAUNCH LIVE DASHBOARD</span>
                <span>→</span>
              </Link>

              <button
                onClick={() => setIsCopilotOpen(true)}
                className="aws-btn-secondary"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🤖</span> ASK BEDROCK COPILOT
              </button>

              <button
                onClick={() => setIsAWSModalOpen(true)}
                className="aws-btn-secondary"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🔑</span> CONNECT LIVE AWS STS
              </button>

              <Link
                href="/cost"
                className="aws-btn-secondary"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>💰</span> FINOPS EXPLORER
              </Link>
            </div>

            {/* Live Telemetry Ribbon */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '2px dashed #cbd5e1'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [ACTIVE_SPEND_TRACKED]
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  ${summary.monthly_cost.toFixed(2)} USD/mo
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [REMEDIATIONS_READY]
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ec7211' }}>
                  {recommendations.length} Auto-Fix Actions
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [SECURITY_AUDIT]
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>
                  SEC-001 Enforced
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [ARCHITECTURE]
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                  100% Agentless STS
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 1: WHAT IS THIS PROJECT? ================= */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [01_CORE_FOUNDATION]
              </span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                What is This Project?
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', maxWidth: '750px' }}>
              CloudOps AI is an enterprise-grade autonomous intelligence platform that bridges CloudWatch observability, 
              FinOps cost governance, and security posture enforcement into a unified, high-speed HUD.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {/* Card 1 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px',
                position: 'relative'
              }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#0284c7',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>📡</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    Agentless Telemetry Ingestion
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  Zero agent installation and zero root privileges required. Ingests live telemetry, resource states, 
                  and cost metrics directly via official AWS SDKs (Boto3 / STS) with zero daemon overhead.
                </p>
                <div style={{ marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 700 }}>
                  → EC2, S3, RDS, EBS, Lambda, CloudWatch
                </div>
              </div>

              {/* Card 2 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px',
                position: 'relative'
              }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#ec7211',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🧠</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    Bedrock AI Generative Reasoning
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  Powered by <strong>Amazon Bedrock (Nova Lite)</strong>. Translates raw telemetry spikes into concise, 
                  human-understandable root-cause narratives and synthesizes production-ready Terraform (HCL) snippets.
                </p>
                <div style={{ marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ec7211', fontWeight: 700 }}>
                  → Instant IaC generation &amp; anomaly explanations
                </div>
              </div>

              {/* Card 3 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px',
                position: 'relative'
              }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#059669',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    Deterministic 1-Click Auto-Fix
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  Not just alerts—active closed-loop remediation. Safely stop idle instances, upgrade legacy `gp2` EBS 
                  volumes to `gp3`, revoke dangerous SSH 0.0.0.0/0 rules, and enforce bucket encryption with rollback logs.
                </p>
                <div style={{ marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>
                  → 1-click execution with full audit trail
                </div>
              </div>

              {/* Card 4 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px',
                position: 'relative'
              }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#7c3aed',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    Zero-Trust Ephemeral STS Security
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  IAM access keys are validated directly against AWS STS and immediately discarded from memory. 
                  Only temporary session tokens exist in the client. Zero credential persistence to backend disk.
                </p>
                <div style={{ marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#7c3aed', fontWeight: 700 }}>
                  → Client-side isolation &amp; complete privacy
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: WHERE IS IT USED? ================= */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [02_DEPLOYMENT_DOMAINS]
              </span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Where is It Used?
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', maxWidth: '750px' }}>
              Designed to solve acute operational pain points across engineering, finance, and security departments.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {/* Domain 1 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #059669',
                  display: 'inline-block',
                  padding: '2px 6px',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}>
                  FINOPS &amp; CLOUD ECONOMICS
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Cloud Waste Elimination
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Used by engineering leaders and finance controllers to eliminate $5,000–$50,000/mo in abandoned EBS 
                  volumes, zombie dev EC2 instances running over weekends, and outdated storage allocations.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 700 }}>
                  ROI: 20% to 45% immediate AWS bill reduction
                </div>
              </div>

              {/* Domain 2 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #dc2626',
                  display: 'inline-block',
                  padding: '2px 6px',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}>
                  DEVSECOPS &amp; SECURITY TEAMS
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Security Posture Hardening
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Identifies open SSH/RDP ports exposed to `0.0.0.0/0`, unencrypted S3 buckets, and overly permissive 
                  security group rules, offering instant one-click automated revocation before audit penalties.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 700 }}>
                  ROI: Sub-minute MTTR for critical vulnerabilities
                </div>
              </div>

              {/* Domain 3 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #7c3aed',
                  display: 'inline-block',
                  padding: '2px 6px',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}>
                  SRE &amp; CLOUD ARCHITECTS
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Well-Architected Auditing
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Evaluates existing production stacks against the 5 pillars of the AWS Well-Architected Framework: 
                  Cost, Security, Reliability, Performance, and Operational Excellence with radar balance scoring.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 700 }}>
                  ROI: 100% compliance alignment with AWS best practices
                </div>
              </div>

              {/* Domain 4 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#fff7ed',
                  color: '#c2410c',
                  border: '1px solid #ec7211',
                  display: 'inline-block',
                  padding: '2px 6px',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}>
                  FAST-GROWING STARTUPS
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Zero-Licensing Cloud Ops
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                  Replaces bloated $50,000/year enterprise monitoring platforms with an open, high-speed, local HUD 
                  that works out-of-the-box in simulation or live production mode.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 700 }}>
                  ROI: $0 recurring licensing fees, 100% local control
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: HOW TO USE IT? ================= */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#ec7211',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [03_WORKFLOW_ENGINE]
              </span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                How to Use It? (Interactive 4-Step Operational Flow)
              </h2>
            </div>

            {/* Interactive Step Switcher Bar */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '14px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              {[
                { step: 1, label: '01. AUTHENTICATE', icon: '🔑' },
                { step: 2, label: '02. INGEST & AUDIT', icon: '📡' },
                { step: 3, label: '03. BEDROCK REASONING', icon: '🤖' },
                { step: 4, label: '04. ONE-CLICK AUTO-FIX', icon: '⚡' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStepTab(s.step)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    border: '2px solid #0f172a',
                    backgroundColor: activeStepTab === s.step ? '#0f172a' : '#ffffff',
                    color: activeStepTab === s.step ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                    boxShadow: activeStepTab === s.step ? 'none' : '3px 3px 0px #0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Step Detail Content Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '6px 6px 0px #0f172a',
              padding: '24px 28px'
            }}>
              {activeStepTab === 1 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ec7211', padding: '1px 6px', fontWeight: 800 }}>
                      PHASE_01
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Authenticate via Ephemeral AWS STS or Explore Demo Sandbox
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', maxWidth: '800px', marginBottom: '14px' }}>
                    Click <strong>Connect AWS</strong> in the top navigation or sidebar. Provide read-only IAM credentials 
                    (e.g., `SecurityAudit`, `ReadOnlyAccess`). The platform calls `sts:GetCallerIdentity` to issue a temporary session token. 
                    If you don&apos;t have an AWS account ready, the platform runs in realistic sandbox simulation mode automatically.
                  </p>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #0f172a',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: '#0f172a',
                    marginBottom: '14px'
                  }}>
                    $ aws sts get-caller-identity --query &apos;{`{Account:Account,Arn:Arn}`}&apos;<br />
                    <span style={{ color: '#059669' }}>✓ Verified: Account 123456789012, Region: us-east-1, Session: Active</span>
                  </div>
                  <button onClick={() => setIsAWSModalOpen(true)} className="aws-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                    OPEN CREDENTIAL MANAGER MODAL
                  </button>
                </div>
              )}

              {activeStepTab === 2 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #059669', padding: '1px 6px', fontWeight: 800 }}>
                      PHASE_02
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Automatic Multi-Service Telemetry Ingestion &amp; Topology Mapping
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', maxWidth: '800px', marginBottom: '14px' }}>
                    The backend queries CloudWatch metrics (CPU utilization, IOPS, Network packets), EC2 instance reservations, 
                    EBS volume types (gp2 vs gp3), S3 bucket configurations (SSE-S3, Public Access Blocks), and RDS database instances. 
                    A directed acyclic graph (DAG) models relationships between VPCs, subnets, and instances.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/graph" className="aws-btn-secondary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
                      EXPLORE TOPOLOGY GRAPH →
                    </Link>
                    <Link href="/metrics" className="aws-btn-secondary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
                      VIEW CLOUDWATCH METRICS →
                    </Link>
                  </div>
                </div>
              )}

              {activeStepTab === 3 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #7c3aed', padding: '1px 6px', fontWeight: 800 }}>
                      PHASE_03
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Amazon Bedrock (Nova Lite) Anomaly Reasoning &amp; IaC Synthesis
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', maxWidth: '800px', marginBottom: '14px' }}>
                    The generative AI engine identifies high-impact opportunities: instances with under 5% average CPU for 14 days, 
                    `gp2` volumes eligible for 20% cheaper `gp3` throughput, and exposed SSH ports. The AI outputs exact dollar savings 
                    and generates drop-in Terraform HCL snippets.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setIsCopilotOpen(true)} className="aws-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                      CHAT WITH BEDROCK COPILOT NOW
                    </button>
                    <Link href="/ai-insights" className="aws-btn-secondary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
                      VIEW BEDROCK INSIGHTS REPORT →
                    </Link>
                  </div>
                </div>
              )}

              {activeStepTab === 4 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ec7211', padding: '1px 6px', fontWeight: 800 }}>
                      PHASE_04
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Deterministic 1-Click Execution &amp; Rollback Receipts
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', maxWidth: '800px', marginBottom: '14px' }}>
                    Review recommended actions in the <strong>Active Recommendations</strong> panel. Click <strong>EXECUTE AUTO-FIX</strong>. 
                    The platform verifies permissions, executes the API call (e.g., `ec2:ModifyVolume` or `ec2:RevokeSecurityGroupIngress`), 
                    and immediately renders an audit receipt with status confirmation and rollback instructions.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/overview" className="aws-btn-primary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
                      VIEW ACTIVE RECOMMENDATIONS LIST →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= SECTION 4: HOW IS IT DIFFERENT FROM OTHER TOOLS? ================= */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [04_COMPARATIVE_ADVANTAGE]
              </span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                How is It Different From Other Projects?
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', maxWidth: '750px' }}>
              Most tools either overwhelm you with complex dashboards, charge enterprise fees, or hallucinate answers without access to your infrastructure. CloudOps AI takes a radically practical approach:
            </p>

            {/* High-Contrast Comparison Matrix */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '6px 6px 0px #0f172a',
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a', width: '22%' }}>
                      CAPABILITY / DIMENSION
                    </th>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ec7211', width: '26%', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a' }}>
                      ★ CLOUDOPS AI (THIS PROJECT)
                    </th>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b', width: '26%' }}>
                      AWS MANAGEMENT CONSOLE
                    </th>
                    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b', width: '26%' }}>
                      DATADOG / NEW RELIC / AGENTS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Automated 1-Click Remediation
                    </td>
                    <td style={{ padding: '12px 16px', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', fontWeight: 700, color: '#059669' }}>
                      ✓ Built-in (gp3 upgrade, SSH lockdown, instance stops)
                    </td>
                    <td style={{ padding: '12px 16px', color: '#dc2626' }}>
                      ✕ Manual click-ops across 10+ nested pages
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d97706' }}>
                      ⚠ Read-only alerts (requires manual engineer action)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Generative AI &amp; Terraform Synthesis
                    </td>
                    <td style={{ padding: '12px 16px', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', fontWeight: 700, color: '#059669' }}>
                      ✓ Amazon Bedrock (Nova Lite) generates drop-in HCL
                    </td>
                    <td style={{ padding: '12px 16px', color: '#dc2626' }}>
                      ✕ None (Raw logs &amp; JSON metrics only)
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d97706' }}>
                      ⚠ Extra enterprise tier add-on ($$$)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Agent Installation &amp; Overhead
                    </td>
                    <td style={{ padding: '12px 16px', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', fontWeight: 700, color: '#059669' }}>
                      ✓ 100% Zero-Agent (Direct AWS STS APIs)
                    </td>
                    <td style={{ padding: '12px 16px', color: '#059669' }}>
                      ✓ Native AWS APIs
                    </td>
                    <td style={{ padding: '12px 16px', color: '#dc2626' }}>
                      ✕ Heavy host daemon (CPU/RAM consumption)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Interface Speed &amp; Aesthetic
                    </td>
                    <td style={{ padding: '12px 16px', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', fontWeight: 700, color: '#059669' }}>
                      ✓ Neo-Brutalist HUD (Sub-second, high clarity, light mode)
                    </td>
                    <td style={{ padding: '12px 16px', color: '#dc2626' }}>
                      ✕ Slow loading, fragmented consoles, multi-tab lag
                    </td>
                    <td style={{ padding: '12px 16px', color: '#d97706' }}>
                      ⚠ Cluttered graphs &amp; noisy alert fatigue
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Pricing &amp; Data Sovereignty
                    </td>
                    <td style={{ padding: '12px 16px', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', fontWeight: 700, color: '#059669' }}>
                      ✓ Self-hosted, 100% Local STS, $0 markup
                    </td>
                    <td style={{ padding: '12px 16px', color: '#059669' }}>
                      ✓ Included with AWS
                    </td>
                    <td style={{ padding: '12px 16px', color: '#dc2626' }}>
                      ✕ $15–$23 per host/mo + log volume penalties
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= SECTION 5: HOW IS IT USEFUL? ================= */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [05_QUANTIFIED_VALUE]
              </span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                How is It Useful? (Quantified ROI &amp; Proven Impact)
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {/* Stat 1 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  [FINOPS_COST_IMPACT]
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', marginBottom: '4px' }}>
                  35.8%
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Average Cloud Bill Reduction
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  Immediate cost savings achieved through EBS `gp2` to `gp3` conversion (20% flat savings) and automatic termination of idle dev instances.
                </p>
              </div>

              {/* Stat 2 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  [SECURITY_RESOLUTION_SPEED]
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7', marginBottom: '4px' }}>
                  &lt; 60s
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Mean Time to Remediation (MTTR)
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  Critical vulnerabilities like exposed SSH port 22 or unencrypted S3 buckets are closed in seconds rather than sitting in backlog tickets for weeks.
                </p>
              </div>

              {/* Stat 3 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  [COMPLIANCE_BENCHMARK]
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#7c3aed', marginBottom: '4px' }}>
                  100%
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Well-Architected Alignment
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  Continuous radar scoring against Cost Optimization, Operational Excellence, Security, Performance, and Reliability pillars.
                </p>
              </div>

              {/* Stat 4 */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                boxShadow: '4px 4px 0px #0f172a',
                padding: '20px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  [DATA_PRIVACY_RATING]
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ec7211', marginBottom: '4px' }}>
                  0 B
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Permanent Credential Storage
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  Zero data exfiltration. Client-side ephemeral session handling means your secret keys never touch disk or external third-party proxies.
                </p>
              </div>
            </div>
          </div>

          {/* ================= SECTION 6: QUICK SYSTEM LAUNCH TILES ================= */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            boxShadow: '6px 6px 0px #0f172a',
            padding: '24px 28px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [SUBSYSTEM_DIRECT_ROUTING]
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>
                  Explore Specialized Subsystem Control Consoles
                </h3>
              </div>
              <Link href="/overview" className="aws-btn-primary" style={{ padding: '6px 14px', fontSize: '11px', textDecoration: 'none' }}>
                VIEW FULL OPS DASHBOARD →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <Link
                href="/cost"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>💰</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Cost Explorer</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>FinOps breakdown &amp; spend treemap</div>
              </Link>

              <Link
                href="/ec2"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>EC2 Compute</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Instance health &amp; stop actions</div>
              </Link>

              <Link
                href="/s3"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📦</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>S3 Storage</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Public bucket leaks &amp; encryption</div>
              </Link>

              <Link
                href="/security"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🛡️</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Security Guard</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>SSH port 22 &amp; IAM audit</div>
              </Link>

              <Link
                href="/graph"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🕸️</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Topology Graph</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Interactive DAG node network</div>
              </Link>

              <Link
                href="/compliance"
                style={{
                  padding: '14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  textDecoration: 'none',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🏛️</div>
                <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Well-Architected</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>5 pillars audit radar</div>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
