'use client';

import React from 'react';
import { AIReport } from '../lib/api';

interface AIReportCardProps {
  report: AIReport | string;
}

function ScoreBadge({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
  const pct = Math.round((score / maxScore) * 100);
  const color = pct >= 80 ? '#137333' : pct >= 60 ? '#b06000' : '#c5221f';
  const bg = pct >= 80 ? '#e6f4ea' : pct >= 60 ? '#fff8e6' : '#fce8e6';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '14px 20px',
      backgroundColor: bg,
      border: `1px solid ${color}`,
      borderRadius: '4px',
      minWidth: '120px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 800, color }}>{score}<span style={{ fontSize: '14px', fontWeight: 500 }}>/{maxScore}</span></div>
      <div style={{ width: '100%', height: '4px', backgroundColor: '#eaeded', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '2px' }} />
      </div>
    </div>
  );
}

export default function AIReportCard({ report }: AIReportCardProps) {
  const isStringReport = typeof report === 'string';
  const reportObj = !isStringReport ? (report as AIReport) : null;

  return (
    <div className="aws-card" style={{ border: '1px solid #d5dbdb' }}>
      <div className="aws-card-header" style={{ backgroundColor: '#16191f', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#ec7211',
            color: '#ffffff',
            padding: '3px 6px',
            borderRadius: '2px',
            fontWeight: 700,
            fontSize: '11px'
          }}>
            BEDROCK AI
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>
            Amazon Bedrock Infrastructure Intelligence Report
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#d5dbdb', fontWeight: 400 }}>
          Model: Amazon Nova Lite (v1.0) — Structured JSON Output
        </span>
      </div>

      <div className="aws-card-body" style={{ backgroundColor: '#ffffff' }}>
        {isStringReport ? (
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            color: '#16191f',
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

            {/* Executive Summary */}
            {reportObj?.executive_summary && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16191f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📋 Executive Summary
                </h4>
                <p style={{ fontSize: '14px', color: '#545b64', lineHeight: '1.6', backgroundColor: '#fafafa', padding: '12px 16px', borderRadius: '4px', border: '1px solid #eaeded' }}>
                  {reportObj.executive_summary}
                </p>
              </div>
            )}

            {/* Estimated Savings banner */}
            {reportObj?.estimated_savings && (
              <div style={{
                backgroundColor: '#e6f4ea',
                border: '1px solid #137333',
                padding: '14px 20px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#137333', textTransform: 'uppercase' }}>
                    Estimated Potential Monthly Savings
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#137333', marginTop: '2px' }}>
                    {reportObj.estimated_savings}
                  </div>
                </div>
                <button className="aws-btn-primary" style={{ backgroundColor: '#137333', borderColor: '#137333' }}>
                  Apply AI Recommendations
                </button>
              </div>
            )}

            {/* Priority Actions */}
            {reportObj?.priority_actions && reportObj.priority_actions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16191f', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚡ Priority Action Items
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reportObj.priority_actions.map((action, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      border: '1px solid #eaeded',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#16191f'
                    }}>
                      <span style={{
                        backgroundColor: '#16191f',
                        color: '#ffffff',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
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
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terraform Remediation */}
            {reportObj?.terraform_remediation && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16191f', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔧 AI-Generated Terraform Remediation
                </h4>
                <div style={{ backgroundColor: '#0d1117', borderRadius: '4px', padding: '16px', overflow: 'auto', border: '1px solid #30363d' }}>
                  <pre style={{ margin: 0, fontSize: '13px', color: '#e6edf3', fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {reportObj.terraform_remediation
                      .replace(/^```hcl\n?/, '')
                      .replace(/\n?```$/, '')}
                  </pre>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#545b64', display: 'flex', gap: '16px' }}>
                  <span>1. Save as <code style={{ backgroundColor: '#f4f4f4', padding: '1px 4px', borderRadius: '2px' }}>main.tf</code></span>
                  <span>2. Run <code style={{ backgroundColor: '#f4f4f4', padding: '1px 4px', borderRadius: '2px' }}>terraform plan</code></span>
                  <span>3. Run <code style={{ backgroundColor: '#f4f4f4', padding: '1px 4px', borderRadius: '2px' }}>terraform apply</code></span>
                </div>
              </div>
            )}

            {/* Legacy cost_optimization field */}
            {reportObj?.cost_optimization && !reportObj?.terraform_remediation && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16191f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💰 Cost Optimization Strategy
                </h4>
                <p style={{ fontSize: '14px', color: '#545b64', lineHeight: '1.6', backgroundColor: '#fafafa', padding: '12px 16px', borderRadius: '4px', border: '1px solid #eaeded' }}>
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
