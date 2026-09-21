'use client';

import React, { useState, useEffect } from 'react';
import {
  getActiveSession,
  saveSession,
  clearSession,
  disconnectSession,
  verifyAWSCredentials,
  AWSCredentials,
  AWSSession,
} from '../lib/api';

interface AWSConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export default function AWSConnectModal({ isOpen, onClose, onConnected }: AWSConnectModalProps) {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<AWSSession | null>(null);

  useEffect(() => {
    const sess = getActiveSession();
    if (sess) {
      setActiveSession(sess);
      setRegion(sess.region || 'us-east-1');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim() || !secretKey.trim()) {
      setError('Both Access Key ID and Secret Access Key are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const creds: AWSCredentials = {
      access_key: accessKey.trim(),
      secret_key: secretKey.trim(),
      region: region.trim(),
    };

    const res = await verifyAWSCredentials(creds);
    setLoading(false);

    if (res.valid && res.session_token) {
      // Store only the session token — raw credentials are NOT persisted
      const session: AWSSession = {
        session_token: res.session_token,
        account_id: res.account_id || '',
        arn: res.arn || '',
        region: creds.region,
        connected_at: new Date().toISOString(),
      };
      saveSession(session);
      setActiveSession(session);

      // Clear form fields immediately — don't leave keys in state
      setAccessKey('');
      setSecretKey('');
      setSuccess(`✓ Connected to AWS Account ${res.account_id || ''}!`);

      setTimeout(() => {
        if (onConnected) onConnected();
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'AWS authentication failed. Please verify your keys.');
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await disconnectSession(); // Calls DELETE /aws/session on backend
    setActiveSession(null);
    setAccessKey('');
    setSecretKey('');
    setLoading(false);
    setSuccess('Disconnected. Platform returned to Demo Mode.');
    if (onConnected) onConnected();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      <div
        className="aws-card"
        style={{
          width: '540px',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          border: '2px solid #0f172a',
          boxShadow: '8px 8px 0px #0f172a',
          overflow: 'hidden',
        }}
      >
        {/* Modal Window Titlebar */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0f172a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                backgroundColor: '#ec7211',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '11px',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono, monospace)',
                border: '1.5px solid #0f172a',
                letterSpacing: '0.05em',
              }}
            >
              AWS_STS
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#0f172a',
              }}
            >
              [AUTH_MANAGER.EXE]
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 700,
                marginRight: '6px',
              }}
            >
              [_] [□]
            </span>
            <button
              onClick={onClose}
              aria-label="Close Modal"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #0f172a',
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: 900,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '1px 1px 0px #0f172a',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>

          {/* Connected State */}
          {activeSession ? (
            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#ecfdf5',
                border: '2px solid #059669',
                boxShadow: '3px 3px 0px #059669',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: '#059669',
                  fontSize: '13px',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                ✓ AWS_ACCOUNT_CONNECTED :: ACTIVE_SESSION
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#0f172a',
                  lineHeight: '1.8',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <div><strong>ACCOUNT_ID:</strong> {activeSession.account_id || 'Verified'}</div>
                <div><strong>ARN:</strong> {activeSession.arn || 'IAM Identity Active'}</div>
                <div><strong>REGION:</strong> {activeSession.region}</div>
                <div><strong>CONNECTED_AT:</strong> {new Date(activeSession.connected_at).toLocaleString()}</div>
              </div>
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #059669',
                  fontSize: '11px',
                  color: '#047857',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                🔒 <strong>SECURITY_ENFORCED:</strong> Raw keys validated via STS GetCallerIdentity &amp; discarded. Only temporary STS session token retained in memory.
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="aws-btn-secondary"
                style={{
                  marginTop: '14px',
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  fontSize: '11px',
                }}
              >
                {loading ? 'DISCONNECTING...' : 'DISCONNECT & REVERT TO DEMO MODE'}
              </button>
            </div>
          ) : (
            <div
              style={{
                fontSize: '12px',
                color: '#475569',
                marginBottom: '18px',
                lineHeight: '1.6',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #0f172a',
              }}
            >
              Paste your IAM Access Key credentials below. They are validated via <strong>AWS STS</strong> and then
              discarded — only an ephemeral session token is stored in your client.
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '2px solid #dc2626',
                color: '#dc2626',
                fontSize: '12px',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                border: '2px solid #059669',
                color: '#059669',
                fontSize: '12px',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleConnect}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em',
                }}
              >
                AWS_ACCESS_KEY_ID:
              </label>
              <input
                type="text"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #0f172a',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em',
                }}
              >
                AWS_SECRET_ACCESS_KEY:
              </label>
              <input
                type="password"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #0f172a',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em',
                }}
              >
                AWS_REGION:
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #0f172a',
                  fontSize: '12px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                <option value="us-east-2">us-east-2 (Ohio)</option>
                <option value="us-west-1">us-west-1 (N. California)</option>
                <option value="us-west-2">us-west-2 (Oregon)</option>
                <option value="eu-west-1">eu-west-1 (Ireland)</option>
                <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="aws-btn-secondary"
                style={{ padding: '8px 14px', fontSize: '11px' }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="aws-btn-primary"
                style={{ padding: '8px 16px', fontSize: '11px' }}
              >
                {loading ? 'VERIFYING_WITH_STS...' : 'CONNECT_AWS_SESSION'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
