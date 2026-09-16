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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner with Checkmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          backgroundColor: '#e6f4ea',
          border: '1px solid #ceead6',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#137333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(19, 115, 51, 0.25)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#137333' }}>
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
          <p style={{ fontSize: '13px', color: '#16191f', marginTop: '2px' }}>
            {result.action_taken}
          </p>
        </div>
      </div>

      {/* Audit Confirmation Card */}
      <div
        style={{
          border: '1px solid #eaeded',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f2f3f3', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>
              Finding ID:
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0073bb', fontSize: '13px' }}>
              {result.finding_id}
            </span>
            <span style={{ fontSize: '12px', color: '#879596' }}>•</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#16191f' }}>
              {result.finding_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#545b64' }}>Execution:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#137333', fontWeight: 600 }}>
              {result.execution_time_ms} ms
            </span>
          </div>
        </div>

        {/* Target Resource */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#545b64', width: '120px' }}>Modified Resource:</span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f2f3f3',
              padding: '3px 8px',
              borderRadius: '3px',
              color: '#16191f',
              fontWeight: 600,
            }}
          >
            {result.resource_id}
          </span>
        </div>

        {/* Audit ID */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#545b64', width: '120px' }}>Audit Receipt ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ec7211', fontWeight: 600 }}>
              {result.audit_id}
            </span>
          </div>
          <button
            type="button"
            onClick={copyAuditId}
            style={{
              background: 'none',
              border: '1px solid #d5dbdb',
              borderRadius: '2px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              color: '#545b64',
            }}
          >
            {copied ? '✓ Copied' : 'Copy ID'}
          </button>
        </div>

        {/* Account & Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#545b64', width: '120px' }}>Target Account:</span>
          <span style={{ fontSize: '12px', color: '#16191f' }}>
            {result.account_id} ({result.region})
          </span>
        </div>

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#545b64', width: '120px' }}>Timestamp:</span>
          <span style={{ fontSize: '12px', color: '#545b64' }}>
            {formatDateString(result.timestamp)}
          </span>
        </div>

        {/* Specific technical details */}
        {result.details && Object.keys(result.details).length > 0 && (
          <div
            style={{
              marginTop: '6px',
              padding: '10px 12px',
              backgroundColor: '#fafafa',
              borderRadius: '3px',
              border: '1px solid #eaeded',
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#16191f', marginBottom: '6px' }}>
              Execution Technical Details:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {result.details.target_type && (
                <div>
                  <span style={{ color: '#545b64' }}>New Type: </span>
                  <strong style={{ color: '#137333' }}>{result.details.target_type}</strong>
                </div>
              )}
              {result.details.estimated_monthly_savings_usd && (
                <div>
                  <span style={{ color: '#545b64' }}>Est. Savings: </span>
                  <strong style={{ color: '#137333' }}>${result.details.estimated_monthly_savings_usd}/mo</strong>
                </div>
              )}
              {result.details.target_cidr && (
                <div>
                  <span style={{ color: '#545b64' }}>Restricted CIDR: </span>
                  <strong style={{ color: '#0073bb' }}>{result.details.target_cidr}</strong>
                </div>
              )}
              {result.details.encryption_algorithm && (
                <div>
                  <span style={{ color: '#545b64' }}>Encryption: </span>
                  <strong style={{ color: '#137333' }}>{result.details.encryption_algorithm} (SSE-S3)</strong>
                </div>
              )}
              {result.details.block_public_acls && (
                <div>
                  <span style={{ color: '#545b64' }}>Public Access: </span>
                  <strong style={{ color: '#137333' }}>All 4 Blocks Enabled</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Done Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onDone}
          className="aws-btn-primary"
          style={{ backgroundColor: '#137333', borderColor: '#137333', padding: '8px 20px' }}
        >
          ✓ Done &amp; Refresh Live Dashboard
        </button>
      </div>
    </div>
  );
}
