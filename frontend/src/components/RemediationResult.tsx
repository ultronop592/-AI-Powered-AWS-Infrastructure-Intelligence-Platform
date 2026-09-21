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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-mono)' }}>
      {/* Top Banner with Checkmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px 16px',
          backgroundColor: '#ecfdf5',
          border: '2px solid #0f172a',
          boxShadow: '3px 3px 0px #0f172a',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#059669',
            border: '1.5px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', margin: 0, fontFamily: 'var(--font-display)' }}>
              Remediation Applied &amp; Enforced!
            </h3>
            <span className={`aws-badge ${result.is_demo ? 'aws-badge-warning' : 'aws-badge-success'}`}>
              {result.is_demo ? 'SIMULATION' : 'LIVE AWS'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#1e293b', marginTop: '3px', margin: 0 }}>
            {result.action_taken}
          </p>
        </div>
      </div>

      {/* Audit Confirmation Receipt Box */}
      <div
        style={{
          border: '2px solid #0f172a',
          boxShadow: '3px 3px 0px #0f172a',
          backgroundColor: '#ffffff',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px dashed #0f172a', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
              FINDING:
            </span>
            <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '12px' }}>
              [{result.finding_id}]
            </span>
            <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>
              {result.finding_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#64748b' }}>EXEC_TIME:</span>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '1px 6px', border: '1px solid #0f172a' }}>
              {result.execution_time_ms} ms
            </span>
          </div>
        </div>

        {/* Target Resource */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ color: '#64748b', width: '140px' }}>TARGET_RESOURCE:</span>
          <span
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #0f172a',
              padding: '2px 8px',
              color: '#0f172a',
              fontWeight: 700,
            }}
          >
            {result.resource_id}
          </span>
        </div>

        {/* Audit ID */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#64748b', width: '140px' }}>AUDIT_RECEIPT_ID:</span>
            <span style={{ color: '#ec7211', fontWeight: 700 }}>
              {result.audit_id}
            </span>
          </div>
          <button
            type="button"
            onClick={copyAuditId}
            style={{
              background: '#f8fafc',
              border: '1px solid #0f172a',
              boxShadow: '1px 1px 0px #0f172a',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              color: '#0f172a',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}
          >
            {copied ? '✓ COPIED' : 'COPY_ID'}
          </button>
        </div>

        {/* Account & Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ color: '#64748b', width: '140px' }}>ACCOUNT_METADATA:</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            {result.account_id} ({result.region})
          </span>
        </div>

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ color: '#64748b', width: '140px' }}>TIMESTAMP:</span>
          <span style={{ color: '#64748b' }}>
            {formatDateString(result.timestamp)}
          </span>
        </div>

        {/* Specific technical details */}
        {result.details && Object.keys(result.details).length > 0 && (
          <div
            style={{
              marginTop: '4px',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #0f172a',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              [EXECUTION_TECHNICAL_DETAILS]
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {result.details.target_type && (
                <div>
                  <span style={{ color: '#64748b' }}>NEW_TYPE: </span>
                  <strong style={{ color: '#059669' }}>{result.details.target_type}</strong>
                </div>
              )}
              {result.details.estimated_monthly_savings_usd && (
                <div>
                  <span style={{ color: '#64748b' }}>EST_SAVINGS: </span>
                  <strong style={{ color: '#059669' }}>${result.details.estimated_monthly_savings_usd}/MO</strong>
                </div>
              )}
              {result.details.target_cidr && (
                <div>
                  <span style={{ color: '#64748b' }}>ALLOWED_CIDR: </span>
                  <strong style={{ color: '#0284c7' }}>{result.details.target_cidr}</strong>
                </div>
              )}
              {result.details.encryption_algorithm && (
                <div>
                  <span style={{ color: '#64748b' }}>ENCRYPTION: </span>
                  <strong style={{ color: '#059669' }}>{result.details.encryption_algorithm} (SSE-S3)</strong>
                </div>
              )}
              {result.details.block_public_acls && (
                <div>
                  <span style={{ color: '#64748b' }}>PUBLIC_ACCESS: </span>
                  <strong style={{ color: '#059669' }}>ALL 4 BLOCKS ENABLED</strong>
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
          style={{ backgroundColor: '#059669', borderColor: '#0f172a', padding: '8px 20px' }}
        >
          ✓ DONE &amp; REFRESH TELEMETRY
        </button>
      </div>
    </div>
  );
}
