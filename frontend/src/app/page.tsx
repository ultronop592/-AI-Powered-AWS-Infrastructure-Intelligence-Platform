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

        <main style={{ flex: 1, padding: '20px 28px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          
          {/* Top Status Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '2px solid #0f172a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '3px 8px',
                fontWeight: 800,
              }}>
                [PRODUCT_HQ]
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                :: AUTONOMOUS_AWS_INTELLIGENCE_PLATFORM
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="anim-pulse" style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1.5px solid #059669',
                padding: '2px 8px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#059669', display: 'inline-block' }}></span>
                BEDROCK_NOVA_ONLINE
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                border: '1.5px solid #0284c7',
                padding: '2px 8px',
                fontWeight: 800
              }}>
                STS: CLIENT_ISOLATED
              </span>
            </div>
          </div>

          {/* ================= HERO FRAME ================= */}
          <div className="hover-neo" style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            boxShadow: '4px 4px 0px #0f172a',
            padding: '24px 28px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffedd5',
                border: '1.5px solid #ea580c',
                color: '#9a3412',
                padding: '2px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
              }}>
                <span className="anim-float">⚡</span> AUTONOMOUS FINOPS &amp; SECOPS CONTROL PLANE
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: '#475569',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '2px 6px'
              }}>
                v2.0_READY
              </span>
            </div>

            <h1 style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '10px',
            }}>
              Autonomous AWS Cloud Intelligence &amp; 1-Click Self-Healing
            </h1>

            <p style={{
              fontSize: '14px',
              color: '#475569',
              lineHeight: '1.5',
              maxWidth: '820px',
              marginBottom: '20px',
            }}>
              Zero-agent observability. Ingests CloudWatch telemetry, analyzes root causes with <strong>Amazon Bedrock (Nova Lite)</strong>, 
              and executes instant 1-click remediations across EC2, S3, RDS, EBS, and IAM.
            </p>

            {/* Hero Launchpad Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <Link
                href="/overview"
                className="aws-btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  backgroundColor: '#ec7211',
                  color: '#ffffff',
                  boxShadow: '3px 3px 0px #0f172a'
                }}
              >
                <span>🚀 LAUNCH LIVE DASHBOARD</span>
                <span>→</span>
              </Link>

              <button
                onClick={() => setIsCopilotOpen(true)}
                className="aws-btn-secondary hover-neo"
                style={{
                  padding: '9px 16px',
                  fontSize: '12px',
                  backgroundColor: '#0f172a',
                  borderColor: '#0f172a',
                  color: '#ffffff'
                }}
              >
                <span>🤖</span> BEDROCK AI COPILOT
              </button>

              <button
                onClick={() => setIsAWSModalOpen(true)}
                className="aws-btn-secondary hover-neo"
                style={{
                  padding: '9px 16px',
                  fontSize: '12px',
                  backgroundColor: '#f0fdf4',
                  borderColor: '#059669',
                  color: '#047857'
                }}
              >
                <span>🔑</span> CONNECT AWS STS
              </button>

              <Link
                href="/cost"
                className="aws-btn-secondary hover-neo"
                style={{
                  padding: '9px 16px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  backgroundColor: '#f0f9ff',
                  borderColor: '#0284c7',
                  color: '#0369a1'
                }}
              >
                <span>💰</span> FINOPS EXPLORER
              </Link>
            </div>

            {/* Live Telemetry Ribbon */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '2px dashed #e2e8f0'
            }}>
              <div style={{ backgroundColor: '#fffaf5', border: '1.5px solid #ea580c', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#c2410c', fontWeight: 800 }}>
                  [MONTHLY_SPEND]
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  ${summary.monthly_cost.toFixed(2)}/mo
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #059669', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#047857', fontWeight: 800 }}>
                  [AUTO_FIX_ACTIONS]
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>
                  {recommendations.length} Detected
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #0284c7', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0369a1', fontWeight: 800 }}>
                  [SECURITY_AUDIT]
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                  SEC-001 PASS
                </div>
              </div>

              <div style={{ backgroundColor: '#f1f5f9', border: '1.5px solid #0f172a', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 800 }}>
                  [INFRA_DAG]
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  100% Agentless
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 1: WHAT IS THIS PROJECT? ================= */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [01_CORE]
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                What is This Project?
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {/* Card 1: Blue */}
              <div className="hover-neo" style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #0f172a',
                borderLeft: '6px solid #0284c7',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📡</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 6px',
                    border: '1px solid #0284c7',
                    fontWeight: 800
                  }}>
                    ZERO_AGENT
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Telemetry Ingestion
                </h3>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                  Direct AWS SDK polling for EC2, S3, RDS, EBS, Lambda, and CloudWatch. Zero host agents or root privileges.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #0284c7', padding: '1px 5px', color: '#0284c7', fontWeight: 700 }}>
                    Boto3 Core
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #0284c7', padding: '1px 5px', color: '#0284c7', fontWeight: 700 }}>
                    Sub-second DAG
                  </span>
                </div>
              </div>

              {/* Card 2: Orange */}
              <div className="hover-neo" style={{
                backgroundColor: '#fffaf5',
                border: '2px solid #0f172a',
                borderLeft: '6px solid #ec7211',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🧠</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#ffedd5',
                    color: '#c2410c',
                    padding: '2px 6px',
                    border: '1px solid #ec7211',
                    fontWeight: 800
                  }}>
                    NOVA_LITE
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Bedrock AI Reasoning
                </h3>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                  Synthesizes alarms into plain root causes and instantly generates drop-in Terraform (HCL) fixes.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #ec7211', padding: '1px 5px', color: '#ec7211', fontWeight: 700 }}>
                    Terraform Gen
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #ec7211', padding: '1px 5px', color: '#ec7211', fontWeight: 700 }}>
                    Cost Attribution
                  </span>
                </div>
              </div>

              {/* Card 3: Green */}
              <div className="hover-neo" style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #0f172a',
                borderLeft: '6px solid #059669',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 6px',
                    border: '1px solid #059669',
                    fontWeight: 800
                  }}>
                    1-CLICK_FIX
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Deterministic Auto-Fix
                </h3>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                  Safely stops idle compute, converts gp2 to gp3 (20% savings), and locks down public SSH with rollback logs.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #059669', padding: '1px 5px', color: '#059669', fontWeight: 700 }}>
                    Audit Receipts
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #059669', padding: '1px 5px', color: '#059669', fontWeight: 700 }}>
                    Safe Rollback
                  </span>
                </div>
              </div>

              {/* Card 4: Premium Dark Slate */}
              <div className="hover-neo" style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #0f172a',
                borderLeft: '6px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🔒</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '2px 6px',
                    border: '1px solid #0f172a',
                    fontWeight: 800
                  }}>
                    STS_ISOLATED
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Ephemeral Security
                </h3>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                  Zero credential persistence on disk. Validated via STS GetCallerIdentity; temporary tokens only in memory.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #0f172a', padding: '1px 5px', color: '#0f172a', fontWeight: 700 }}>
                    0-Byte Leakage
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffffff', border: '1px solid #0f172a', padding: '1px 5px', color: '#0f172a', fontWeight: 700 }}>
                    Client Isolated
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: WHERE IS IT USED? ================= */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [02_DOMAINS]
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Where is It Used?
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {/* Domain 1: FinOps */}
              <div className="hover-neo" style={{
                backgroundColor: '#fffaf5',
                border: '2px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>💰</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#ffedd5', color: '#c2410c', padding: '2px 6px', border: '1px solid #ea580c', fontWeight: 800 }}>
                    FINOPS
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Cloud Waste Elimination
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  Removes unattached EBS volumes, zombie EC2 dev instances, and over-provisioned Lambda memory.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#c2410c', fontWeight: 800 }}>
                  ★ 20% – 45% Monthly Cost Reduction
                </div>
              </div>

              {/* Domain 2: DevSecOps */}
              <div className="hover-neo" style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🛡️</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 6px', border: '1px solid #dc2626', fontWeight: 800 }}>
                    DEVSECOPS
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Security Posture Hardening
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  Detects and revokes open SSH Port 22, public S3 buckets, and unencrypted storage before audits.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#b91c1c', fontWeight: 800 }}>
                  ★ &lt; 60s Vulnerability MTTR
                </div>
              </div>

              {/* Domain 3: SRE */}
              <div className="hover-neo" style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #0f172a',
                borderLeft: '5px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🏛️</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#0f172a', color: '#ffffff', padding: '2px 6px', border: '1px solid #0f172a', fontWeight: 800 }}>
                    SRE_ARCH
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Well-Architected Radar
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  Scores active fleets across 5 AWS pillars: Cost, Security, Reliability, Performance, and Ops.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 800 }}>
                  ★ 100% Best-Practice Alignment
                </div>
              </div>

              {/* Domain 4: Startups */}
              <div className="hover-neo" style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', border: '1px solid #059669', fontWeight: 800 }}>
                    STARTUPS
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Zero-Licensing Cloud Ops
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  High-speed local HUD replacing expensive $50,000/year enterprise monitoring platforms.
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#15803d', fontWeight: 800 }}>
                  ★ $0 Software Markup / Open-Source
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: HOW TO USE IT? ================= */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#ec7211',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [03_PIPELINE]
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                How to Use It? (Interactive 4-Step Flow)
              </h2>
            </div>

            {/* Interactive Step Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { step: 1, label: '01. AUTHENTICATE', color: '#0284c7', bg: '#eff6ff' },
                { step: 2, label: '02. INGEST & AUDIT', color: '#059669', bg: '#f0fdf4' },
                { step: 3, label: '03. BEDROCK REASONING', color: '#0f172a', bg: '#f1f5f9' },
                { step: 4, label: '04. ONE-CLICK AUTO-FIX', color: '#ea580c', bg: '#fff7ed' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStepTab(s.step)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    border: '2px solid #0f172a',
                    backgroundColor: activeStepTab === s.step ? s.color : s.bg,
                    color: activeStepTab === s.step ? '#ffffff' : '#0f172a',
                    boxShadow: activeStepTab === s.step ? 'none' : '2px 2px 0px #0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step Detail Card */}
            <div className="hover-neo" style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '4px 4px 0px #0f172a',
              padding: '18px 22px'
            }}>
              {activeStepTab === 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#eff6ff', color: '#0284c7', border: '1px solid #0284c7', padding: '1px 6px', fontWeight: 800 }}>
                        STEP_01
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Connect via Ephemeral STS or Sandbox Demo
                      </h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      Supply IAM Access Keys via <strong>Connect AWS</strong> or test in Simulation Mode. Keys validate via STS and are never saved to disk.
                    </p>
                  </div>
                  <button onClick={() => setIsAWSModalOpen(true)} className="aws-btn-primary" style={{ padding: '7px 14px', fontSize: '11px' }}>
                    OPEN CREDENTIAL MODAL
                  </button>
                </div>
              )}

              {activeStepTab === 2 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#f0fdf4', color: '#059669', border: '1px solid #059669', padding: '1px 6px', fontWeight: 800 }}>
                        STEP_02
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Continuous CloudWatch &amp; Topology Mapping
                      </h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      Pulls metrics for CPU, IOPS, EBS types (gp2 vs gp3), S3 encryption, and security group rules into an interactive DAG network.
                    </p>
                  </div>
                  <Link href="/graph" className="aws-btn-secondary" style={{ padding: '7px 14px', fontSize: '11px', textDecoration: 'none' }}>
                    VIEW TOPOLOGY GRAPH →
                  </Link>
                </div>
              )}

              {activeStepTab === 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #0f172a', padding: '1px 6px', fontWeight: 800 }}>
                        STEP_03
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Amazon Bedrock Anomaly Synthesis &amp; IaC Code
                      </h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      Nova Lite flags idle instances, misconfigured volumes, and open ports with exact monthly dollar savings and Terraform code.
                    </p>
                  </div>
                  <button onClick={() => setIsCopilotOpen(true)} className="aws-btn-primary" style={{ padding: '7px 14px', fontSize: '11px', backgroundColor: '#0f172a' }}>
                    OPEN BEDROCK COPILOT
                  </button>
                </div>
              )}

              {activeStepTab === 4 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #ea580c', padding: '1px 6px', fontWeight: 800 }}>
                        STEP_04
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Deterministic 1-Click Execution &amp; Rollback Logs
                      </h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      Click <strong>EXECUTE AUTO-FIX</strong> in the recommendations list to apply live modifications with audit receipts.
                    </p>
                  </div>
                  <Link href="/overview" className="aws-btn-primary" style={{ padding: '7px 14px', fontSize: '11px', textDecoration: 'none' }}>
                    SEE RECOMMENDATIONS →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ================= SECTION 4: COMPARISON MATRIX ================= */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [04_MATRIX]
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                How is It Different From Other Solutions?
              </h2>
            </div>

            <div className="hover-neo" style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '4px 4px 0px #0f172a',
              overflowX: 'auto'
            }}>
              <table className="aws-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                    <th style={{ padding: '10px 14px', width: '25%' }}>FEATURE / CAPABILITY</th>
                    <th style={{ padding: '10px 14px', width: '28%', backgroundColor: '#fff7ed', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#ea580c', fontWeight: 800 }}>
                      ★ CLOUDOPS AI (THIS PROJECT)
                    </th>
                    <th style={{ padding: '10px 14px', width: '23%' }}>AWS CONSOLE</th>
                    <th style={{ padding: '10px 14px', width: '24%' }}>DATADOG / AGENTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>1-Click Safe Auto-Remediation</td>
                    <td style={{ backgroundColor: '#fffaf5', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#059669', fontWeight: 800 }}>
                      ✓ BUILT-IN (gp3, SSH, Stop)
                    </td>
                    <td style={{ color: '#dc2626' }}>✕ 10+ Manual Clicks</td>
                    <td style={{ color: '#d97706' }}>⚠ Alerts Only (No Auto-Fix)</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>AI IaC &amp; Terraform Synthesis</td>
                    <td style={{ backgroundColor: '#fffaf5', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#059669', fontWeight: 800 }}>
                      ✓ Amazon Bedrock (Nova Lite)
                    </td>
                    <td style={{ color: '#dc2626' }}>✕ None (Raw JSON)</td>
                    <td style={{ color: '#d97706' }}>⚠ Expensive Add-on</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Host Agent Overhead</td>
                    <td style={{ backgroundColor: '#fffaf5', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#059669', fontWeight: 800 }}>
                      ✓ 100% Agentless STS
                    </td>
                    <td style={{ color: '#059669' }}>✓ Native AWS</td>
                    <td style={{ color: '#dc2626' }}>✕ Heavy Host Daemons</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Speed &amp; HUD Design</td>
                    <td style={{ backgroundColor: '#fffaf5', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#059669', fontWeight: 800 }}>
                      ✓ Sub-Second Neo-Brutalist HUD
                    </td>
                    <td style={{ color: '#dc2626' }}>✕ Multi-Tab Latency</td>
                    <td style={{ color: '#d97706' }}>⚠ Complex Alert Clutter</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Licensing Costs</td>
                    <td style={{ backgroundColor: '#fffaf5', borderLeft: '2px solid #0f172a', borderRight: '2px solid #0f172a', color: '#059669', fontWeight: 800 }}>
                      ✓ $0 / Open-Source Local
                    </td>
                    <td style={{ color: '#059669' }}>✓ Included</td>
                    <td style={{ color: '#dc2626' }}>✕ $15–$23/host/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= SECTION 5: HOW IS IT USEFUL? ================= */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '2px 8px',
                fontWeight: 800,
                border: '1.5px solid #0f172a'
              }}>
                [05_VALUE]
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                How is It Useful? (Measurable ROI)
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              <div className="hover-neo" style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #0f172a',
                borderLeft: '5px solid #059669',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '14px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#047857', fontWeight: 800, marginBottom: '2px' }}>
                  [COST_SAVINGS]
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', lineHeight: 1.1 }}>
                  35.8%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  Average Bill Cut
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  gp2→gp3 + idle stops
                </div>
              </div>

              <div className="hover-neo" style={{
                backgroundColor: '#eff6ff',
                border: '2px solid #0f172a',
                borderLeft: '5px solid #0284c7',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '14px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0369a1', fontWeight: 800, marginBottom: '2px' }}>
                  [SPEED_MTTR]
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7', lineHeight: 1.1 }}>
                  &lt; 60s
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  Mean Time to Fix
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Instant port lockdown
                </div>
              </div>

              <div className="hover-neo" style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #0f172a',
                borderLeft: '5px solid #0f172a',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '14px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 800, marginBottom: '2px' }}>
                  [COMPLIANCE]
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a', lineHeight: 1.1 }}>
                  100%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  WAF Alignment
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  All 5 pillars verified
                </div>
              </div>

              <div className="hover-neo" style={{
                backgroundColor: '#fffaf5',
                border: '2px solid #0f172a',
                borderLeft: '5px solid #ea580c',
                boxShadow: '3px 3px 0px #0f172a',
                padding: '14px'
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#c2410c', fontWeight: 800, marginBottom: '2px' }}>
                  [PRIVACY]
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ea580c', lineHeight: 1.1 }}>
                  0 B
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  Credentials Stored
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Client STS isolation
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 6: QUICK CONSOLE TILES ================= */}
          <div className="hover-neo" style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            boxShadow: '4px 4px 0px #0f172a',
            padding: '18px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 700 }}>
                  [SUBSYSTEMS]
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Specialized Subsystem Consoles
                </h3>
              </div>
              <Link href="/overview" className="aws-btn-primary" style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none' }}>
                FULL OPS DASHBOARD →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px'
            }}>
              <Link href="/cost" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#fffaf5' }}>
                <div style={{ fontSize: '16px' }}>💰</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Cost Explorer</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>FinOps treemap</div>
              </Link>

              <Link href="/ec2" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#eff6ff' }}>
                <div style={{ fontSize: '16px' }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>EC2 Compute</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Instance health</div>
              </Link>

              <Link href="/s3" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#f0fdf4' }}>
                <div style={{ fontSize: '16px' }}>📦</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>S3 Storage</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Bucket encryption</div>
              </Link>

              <Link href="/security" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#fef2f2' }}>
                <div style={{ fontSize: '16px' }}>🛡️</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Security Guard</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Port 22 lockdown</div>
              </Link>

              <Link href="/graph" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#f1f5f9' }}>
                <div style={{ fontSize: '16px' }}>🕸️</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>DAG Graph</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Topology nodes</div>
              </Link>

              <Link href="/compliance" className="hover-neo" style={{ padding: '12px', border: '1.5px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', textDecoration: 'none', color: '#0f172a', backgroundColor: '#fffbeb' }}>
                <div style={{ fontSize: '16px' }}>🏛️</div>
                <div style={{ fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)' }}>WAF Radar</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>5-Pillar scores</div>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
