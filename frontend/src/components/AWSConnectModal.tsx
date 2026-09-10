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
        backgroundColor: 'rgba(22, 25, 31, 0.75)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="aws-card"
        style={{
          width: '520px',
          maxWidth: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#16191f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #ec7211',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                backgroundColor: '#ec7211',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                padding: '2px 8px',
                borderRadius: '2px',
              }}
            >
              AWS
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Connect Your AWS Account</span>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>

          {/* Connected State */}
          {activeSession ? (
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f1f8f5', border: '1px solid #137333', borderRadius: '4px' }}>
              <div style={{ fontWeight: 700, color: '#137333', fontSize: '14px', marginBottom: '6px' }}>
                ✓ AWS Account Connected (Secure Session Active)
              </div>
              <div style={{ fontSize: '13px', color: '#16191f', lineHeight: '1.8' }}>
                <strong>Account ID:</strong> {activeSession.account_id || 'Verified'} <br />
                <strong>ARN:</strong> {activeSession.arn || 'IAM Identity Active'} <br />
                <strong>Region:</strong> {activeSession.region} <br />
                <strong>Connected:</strong> {new Date(activeSession.connected_at).toLocaleString()}
              </div>
              <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '3px', fontSize: '12px', color: '#2e7d32' }}>
                🔒 <strong>Secure:</strong> Your AWS credentials were validated via STS and are not stored locally. Only a temporary session token is kept.
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="aws-btn-secondary"
                style={{ marginTop: '12px', borderColor: '#c5221f', color: '#c5221f', fontSize: '12px' }}
              >
                {loading ? 'Disconnecting...' : 'Disconnect & Switch to Demo Mode'}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#545b64', marginBottom: '20px', lineHeight: '1.5' }}>
              Paste your IAM Access Key credentials below. They are validated via <strong>AWS STS</strong> and then
              discarded — only a secure session token is stored in your browser.
            </p>
          )}

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fce8e6', border: '1px solid #c5221f', color: '#c5221f', borderRadius: '2px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', backgroundColor: '#e6f4ea', border: '1px solid #137333', color: '#137333', borderRadius: '2px', fontSize: '13px', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleConnect}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '6px' }}>
                AWS Access Key ID:
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
                  border: '1px solid #d5dbdb',
                  borderRadius: '2px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '6px' }}>
                AWS Secret Access Key:
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
                  border: '1px solid #d5dbdb',
                  borderRadius: '2px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '6px' }}>
                AWS Region:
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d5dbdb',
                  borderRadius: '2px',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontWeight: 600,
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
              <button type="button" onClick={onClose} className="aws-btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="aws-btn-primary">
                {loading ? 'Verifying with AWS STS...' : 'Connect Live AWS Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
