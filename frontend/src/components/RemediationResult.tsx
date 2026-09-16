'use client';

import React, { useState } from 'react';
import { RemediationResult as RemediationResultType, formatDateString } from '../lib/api';

interface RemediationResultProps {
  result: RemediationResultType;
  onDone: () => void;
}

export default function RemediationResult({ result, onDone }: RemediationResultProps) {
  const [copied, setCopied] = useState(false);

  const copyAuditId = () => {
    if (result.audit_id && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(result.audit_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Banner with Checkmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 18px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 5px rgba(5, 150, 105, 0.25)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#065f46' }}>
              Remediation Applied Successfully!
            </h3>
            {result.is_demo ? (
              <span className="aws-badge aws-badge-warning" style={{ fontSize: '10px' }}>
                DEMO SIMULATION
              </span>
            ) : (
              <span className="aws-badge aws-badge-success" style={{ fontSize: '10px' }}>
                LIVE AWS ENFORCED
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
            {result.action_taken}
          </p>
        </div>
      </div>

      {/* Audit Confirmation Receipt Box */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Finding ID:
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', fontSize: '13px' }}>
              {result.finding_id}
            </span>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {result.finding_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Execution:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#059669', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
              {result.execution_time_ms} ms
            </span>
          </div>
        </div>

        {/* Target Resource */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Modified Resource:</span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '3px 8px',
              borderRadius: '4px',
              color: '#0f172a',
              fontWeight: 600,
            }}
          >
            {result.resource_id}
          </span>
        </div>

        {/* Audit ID */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Audit Receipt ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ec7211', fontWeight: 600 }}>
              {result.audit_id}
            </span>
          </div>
          <button
            type="button"
            onClick={copyAuditId}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            {copied ? '✓ Copied' : 'Copy ID'}
          </button>
        </div>

        {/* Account & Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Target Account:</span>
          <span style={{ fontSize: '12px', color: '#0f172a' }}>
            {result.account_id} ({result.region})
          </span>
        </div>

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Timestamp:</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {formatDateString(result.timestamp)}
          </span>
        </div>

        {/* Specific technical details */}
        {result.details && Object.keys(result.details).length > 0 && (
          <div
            style={{
              marginTop: '4px',
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Execution Technical Details:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {result.details.target_type && (
                <div>
                  <span style={{ color: '#64748b' }}>New Type: </span>
                  <strong style={{ color: '#059669' }}>{result.details.target_type}</strong>
                </div>
              )}
              {result.details.estimated_monthly_savings_usd && (
                <div>
                  <span style={{ color: '#64748b' }}>Est. Savings: </span>
                  <strong style={{ color: '#059669' }}>${result.details.estimated_monthly_savings_usd}/mo</strong>
                </div>
              )}
              {result.details.target_cidr && (
                <div>
                  <span style={{ color: '#64748b' }}>Restricted CIDR: </span>
                  <strong style={{ color: '#0284c7' }}>{result.details.target_cidr}</strong>
                </div>
              )}
              {result.details.encryption_algorithm && (
                <div>
                  <span style={{ color: '#64748b' }}>Encryption: </span>
                  <strong style={{ color: '#059669' }}>{result.details.encryption_algorithm} (SSE-S3)</strong>
                </div>
              )}
              {result.details.block_public_acls && (
                <div>
                  <span style={{ color: '#64748b' }}>Public Access: </span>
                  <strong style={{ color: '#059669' }}>All 4 Blocks Enabled</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Done Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
        <button
          type="button"
          onClick={onDone}
          className="aws-btn-primary"
          style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '9px 22px' }}
        >
          ✓ Done &amp; Refresh Live Dashboard
        </button>
      </div>
    </div>
  );
}
