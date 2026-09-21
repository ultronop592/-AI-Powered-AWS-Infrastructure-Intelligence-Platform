'use client';

import React from 'react';
import { AIReport } from '../lib/api';

interface AIReportCardProps {
  report: AIReport | string | null;
}

function ScoreBadge({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
  const pct = Math.round((score / maxScore) * 100);
  const color = pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626';
  const bg = pct >= 80 ? '#ecfdf5' : pct >= 60 ? '#fffbeb' : '#fef2f2';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '12px 16px',
      backgroundColor: bg,
      border: '2px solid #0f172a',
      boxShadow: '3px 3px 0px #0f172a',
      minWidth: '140px',
      flex: '1 1 140px'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: '#0f172a',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        [{label}]
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color
      }}>
        {score}<span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/{maxScore}</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #0f172a',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

export default function AIReportCard({ report }: AIReportCardProps) {
  if (!report) {
    return (
      <div className="aws-card">
        <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '1px 5px',
              fontWeight: 700,
              fontSize: '10px',
            }}>
              BEDROCK_AI
            </span>
            <span>Amazon Bedrock Infrastructure Intelligence Report</span>
          </div>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
        <div className="aws-card-body" style={{ padding: '28px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '13px', fontFamily: 'var(--font-mono)', margin: 0 }}>
            NO AI REPORT GENERATED YET. CLICK [SYNC] OR CONNECT CREDENTIALS TO RUN BEDROCK INFERENCE.
          </p>
        </div>
      </div>
    );
  }

  const isStringReport = typeof report === 'string';
  const reportObj = !isStringReport ? (report as AIReport) : null;

  return (
    <div className="aws-card">
      {/* Retro OS Window Titlebar */}
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#ec7211',
            color: '#ffffff',
            padding: '1px 5px',
            fontWeight: 700,
            fontSize: '10px',
            fontFamily: 'var(--font-mono)'
          }}>
            AI_NOVA.EXE
          </span>
          <span style={{ fontWeight: 700 }}>Amazon Bedrock Intelligence &amp; Autonomous Audit</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            MODEL: NOVA_LITE_1.0
          </span>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: '18px' }}>
        {isStringReport ? (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#0f172a',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f8fafc',
            padding: '14px',
            border: '1.5px solid #0f172a'
          }}>
            {report as string}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Score Badges Row (Colorful Neo-Brutalist Cards) */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {reportObj?.health_score !== undefined && (
                <ScoreBadge label="CLOUD HEALTH SCORE" score={reportObj.health_score} />
              )}
              {reportObj?.security_score !== undefined && (
                <ScoreBadge label="SECURITY POSTURE" score={reportObj.security_score} />
              )}
              {reportObj?.estimated_savings && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 16px',
                  backgroundColor: '#ecfdf5',
                  border: '2px solid #0f172a',
                  boxShadow: '3px 3px 0px #0f172a',
                  minWidth: '150px',
                  flex: '1 1 150px'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#047857' }}>
                    [POTENTIAL SAVINGS]
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#065f46' }}>
                    {reportObj.estimated_savings}
                  </div>
                  <span style={{ fontSize: '10px', color: '#047857', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    RECOVERABLE / MO
                  </span>
                </div>
              )}
            </div>

            {/* Executive Summary Box */}
            {reportObj?.executive_summary && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #0f172a',
                boxShadow: '2px 2px 0px #0f172a',
                padding: '12px 16px',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#475569',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#ec7211', display: 'inline-block' }}></span>
                  EXECUTIVE_DIAGNOSIS
                </div>
                <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }}>
                  {reportObj.executive_summary}
                </div>
              </div>
            )}

            {/* Priority Actions (Visual Action Cards) */}
            {reportObj?.priority_actions && reportObj.priority_actions.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#475569',
                  marginBottom: '8px',
                }}>
                  [PRIORITY_ACTION_ITEMS ({reportObj.priority_actions.length})]
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reportObj.priority_actions.map((action, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      border: '1.5px solid #0f172a',
                      boxShadow: '2px 2px 0px #0f172a',
                      backgroundColor: '#ffffff',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}>
                      <span style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        width: '20px',
                        height: '20px',
                        border: '1px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ lineHeight: '1.4', fontWeight: 500 }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terraform Remediation Terminal */}
            {reportObj?.terraform_remediation && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: '#f1f5f9',
                  border: '1.5px solid #0f172a',
                  borderBottom: 'none',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  <span>[TERRAFORM_REMEDIATION.TF]</span>
                  <span style={{ color: '#0284c7' }}>HCL READY</span>
                </div>
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '14px',
                  overflow: 'auto',
                  border: '1.5px solid #0f172a',
                  boxShadow: '3px 3px 0px #0f172a'
                }}>
                  <pre style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {reportObj.terraform_remediation
                      .replace(/^```hcl\n?/, '')
                      .replace(/\n?```$/, '')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
