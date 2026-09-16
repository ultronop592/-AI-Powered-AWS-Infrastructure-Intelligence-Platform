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
  const border = pct >= 80 ? '#a7f3d0' : pct >= 60 ? '#fde68a' : '#fecaca';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '14px 20px',
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      minWidth: '130px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color }}>{score}<span style={{ fontSize: '14px', fontWeight: 500, color }}>/{maxScore}</span></div>
      <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '2px' }} />
      </div>
    </div>
  );
}

export default function AIReportCard({ report }: AIReportCardProps) {
  if (!report) {
    return (
      <div className="aws-card">
        <div className="aws-card-header" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '3px 7px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.04em',
            }}>
              BEDROCK AI
            </div>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>
              Amazon Bedrock Infrastructure Intelligence Report
            </span>
          </div>
        </div>
        <div className="aws-card-body" style={{ backgroundColor: '#ffffff', padding: '36px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            No AI intelligence report generated yet for this account. Click Refresh or connect credentials to run an analysis.
          </p>
        </div>
      </div>
    );
  }

  const isStringReport = typeof report === 'string';
  const reportObj = !isStringReport ? (report as AIReport) : null;

  return (
    <div className="aws-card">
      <div className="aws-card-header" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#ec7211',
            color: '#ffffff',
            padding: '3px 7px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.04em',
          }}>
            BEDROCK AI
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>
            Amazon Bedrock Infrastructure Intelligence Report
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>
          Model: Amazon Nova Lite (v1.0) • Structured JSON Output
        </span>
      </div>

      <div className="aws-card-body" style={{ backgroundColor: '#ffffff' }}>
        {isStringReport ? (
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            color: '#0f172a',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {report as string}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Score badges row */}
            {(reportObj?.health_score !== undefined || reportObj?.security_score !== undefined) && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {reportObj?.health_score !== undefined && (
                  <ScoreBadge label="Cloud Health Score" score={reportObj.health_score} />
                )}
                {reportObj?.security_score !== undefined && (
                  <ScoreBadge label="Security Score" score={reportObj.security_score} />
                )}
              </div>
            )}

            {/* Executive Summary Box */}
            {reportObj?.executive_summary && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Executive Summary
                </h4>
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {reportObj.executive_summary}
                </div>
              </div>
            )}

            {/* Estimated Savings banner */}
            {reportObj?.estimated_savings && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '16px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Estimated Potential Monthly Savings
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
                    {reportObj.estimated_savings}
                  </div>
                </div>
                <button className="aws-btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                  Apply AI Recommendations
                </button>
              </div>
            )}

            {/* Priority Actions */}
            {reportObj?.priority_actions && reportObj.priority_actions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Priority Action Items
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reportObj.priority_actions.map((action, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#1e293b'
                    }}>
                      <span style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: '1px',
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ lineHeight: '1.5' }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terraform Remediation */}
            {reportObj?.terraform_remediation && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI-Generated Terraform Remediation
                </h4>
                <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '16px', overflow: 'auto', border: '1px solid #1e293b' }}>
                  <pre style={{ margin: 0, fontSize: '12px', color: '#38bdf8', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {reportObj.terraform_remediation
                      .replace(/^```hcl\n?/, '')
                      .replace(/\n?```$/, '')}
                  </pre>
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', display: 'flex', gap: '16px' }}>
                  <span>1. Save as <code style={{ backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', color: '#0f172a' }}>main.tf</code></span>
                  <span>2. Run <code style={{ backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', color: '#0f172a' }}>terraform plan</code></span>
                  <span>3. Run <code style={{ backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', color: '#0f172a' }}>terraform apply</code></span>
                </div>
              </div>
            )}

            {/* Legacy cost_optimization field */}
            {reportObj?.cost_optimization && !reportObj?.terraform_remediation && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cost Optimization Strategy
                </h4>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {reportObj.cost_optimization}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
