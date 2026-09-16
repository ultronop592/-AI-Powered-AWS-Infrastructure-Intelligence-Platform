'use client';

import React, { useState, useEffect } from 'react';
import {
  Recommendation,
  RemediationResult as RemediationResultType,
  getActiveSession,
  applyRemediation,
} from '../lib/api';
import RemediationResult from './RemediationResult';

interface RemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onRemediated?: (result: RemediationResultType) => void;
}

export default function RemediationModal({
  isOpen,
  onClose,
  recommendation,
  onRemediated,
}: RemediationModalProps) {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [targetCidr, setTargetCidr] = useState<string>('10.0.0.0/16');
  const [revokeOnly, setRevokeOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RemediationResultType | null>(null);

  const session = getActiveSession();
  const isLive = !!session?.session_token;

  useEffect(() => {
    if (isOpen && recommendation) {
      setSelectedResource(
        recommendation.resource_id ||
          (recommendation.affected_resources && recommendation.affected_resources[0]) ||
          ''
      );
      setTargetCidr('10.0.0.0/16');
      setRevokeOnly(false);
      setError(null);
      setResult(null);
      setLoading(false);
    }
  }, [isOpen, recommendation]);

  if (!isOpen || !recommendation) return null;

  const findingId = (recommendation.id || '').toUpperCase();
  const severity = (recommendation.severity || 'MEDIUM').toUpperCase();
  const affectedList = recommendation.affected_resources || (recommendation.resource_id ? [recommendation.resource_id] : []);

  // Determine Boto3 code signature for preview
  let boto3Preview = '';
  if (findingId === 'SEC-001') {
    boto3Preview = revokeOnly
      ? `ec2.revoke_security_group_ingress(\n  GroupId='${selectedResource}',\n  IpPermissions=[{'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}]\n)`
      : `ec2.revoke_security_group_ingress(GroupId='${selectedResource}', ...)\nec2.authorize_security_group_ingress(\n  GroupId='${selectedResource}',\n  IpPermissions=[{'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '${targetCidr}'}]}]\n)`;
  } else if (findingId === 'EBS-001') {
    boto3Preview = `ec2.modify_volume(\n  VolumeId='${selectedResource}',\n  VolumeType='gp3'\n)`;
  } else if (findingId === 'S3-001') {
    boto3Preview = `s3.put_bucket_encryption(\n  Bucket='${selectedResource}',\n  ServerSideEncryptionConfiguration={\n    'Rules': [{'ApplyServerSideEncryptionByDefault': {'SSEAlgorithm': 'AES256'}, 'BucketKeyEnabled': True}]\n  }\n)`;
  } else if (findingId === 'S3-002') {
    boto3Preview = `s3.put_public_access_block(\n  Bucket='${selectedResource}',\n  PublicAccessBlockConfiguration={\n    'BlockPublicAcls': True, 'IgnorePublicAcls': True,\n    'BlockPublicPolicy': True, 'RestrictPublicBuckets': True\n  }\n)`;
  } else {
    boto3Preview = `# Auto-remediation for ${findingId} on ${selectedResource}`;
  }

  const handleApply = async () => {
    if (!selectedResource) {
      setError('Please select or specify a target resource ID.');
      return;
    }

    setLoading(true);
    setError(null);

    const parameters: Record<string, any> = {};
    if (findingId === 'SEC-001') {
      parameters.target_cidr = targetCidr.trim();
      parameters.revoke_only = revokeOnly;
      parameters.ports = [22, 3389];
    }

    try {
      const res = await applyRemediation({
        finding_id: findingId,
        resource_id: selectedResource,
        parameters,
      });

      setLoading(false);
      setResult(res);
      if (onRemediated) {
        onRemediated(res);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Auto-remediation execution failed.');
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(22, 25, 31, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="aws-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Modal Header */}
        <div
          className="aws-card-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #eaeded',
            backgroundColor: '#16191f',
            color: '#ffffff',
            padding: '14px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                One-Click Auto-Remediation
              </div>
              <div style={{ fontSize: '11px', color: '#aab7b8' }}>
                AIOps Autonomous Operations • Boto3 AWS Execution
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#d5dbdb',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {result ? (
            /* Result View */
            <RemediationResult result={result} onDone={handleDone} />
          ) : (
            /* Confirmation & Options Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Account Environment Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  backgroundColor: isLive ? '#e6f4ea' : '#fef7e0',
                  border: isLive ? '1px solid #ceead6' : '1px solid #fce8b2',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{isLive ? '🔒' : '🧪'}</span>
                  <span style={{ fontWeight: 600, color: isLive ? '#137333' : '#b06000' }}>
                    {isLive
                      ? `Connected to AWS Account ${session?.account_id} (${session?.region})`
                      : 'Demo Simulation Mode (Safe dry-run preview)'}
                  </span>
                </div>
                <span className={`aws-badge ${isLive ? 'aws-badge-success' : 'aws-badge-warning'}`}>
                  {isLive ? 'LIVE BOTO3' : 'DEMO MODE'}
                </span>
              </div>

              {/* Finding Summary */}
              <div
                style={{
                  padding: '14px 16px',
                  border: '1px solid #eaeded',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`aws-badge ${
                        severity === 'HIGH' || severity === 'CRITICAL' ? 'aws-badge-danger' : 'aws-badge-warning'
                      }`}
                    >
                      {severity}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#545b64', fontWeight: 600 }}>
                      {findingId}
                    </span>
                    {recommendation.category && (
                      <span style={{ fontSize: '12px', color: '#545b64' }}>• {recommendation.category}</span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#16191f' }}>
                  {recommendation.title}
                </h4>

                <p style={{ fontSize: '12px', color: '#545b64', lineHeight: '1.5' }}>
                  {recommendation.description}
                </p>
              </div>

              {/* Resource Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '6px' }}>
                  Target AWS Resource:
                </label>
                {affectedList.length > 1 ? (
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #aab7b8',
                      borderRadius: '2px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {affectedList.map((resId) => (
                      <option key={resId} value={resId}>
                        {resId}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f2f3f3',
                      borderRadius: '2px',
                      border: '1px solid #eaeded',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0073bb',
                    }}
                  >
                    {selectedResource || 'Auto-detected'}
                  </div>
                )}
              </div>

              {/* Finding-Specific Customization Options */}
              {findingId === 'SEC-001' && (
                <div
                  style={{
                    padding: '14px',
                    border: '1px solid #d5dbdb',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#16191f' }}>
                    SSH/RDP Ingress Restriction Settings:
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={!revokeOnly}
                        onChange={() => setRevokeOnly(false)}
                      />
                      <span>Restrict to Trusted CIDR</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={revokeOnly}
                        onChange={() => setRevokeOnly(true)}
                      />
                      <span>Revoke 0.0.0.0/0 Only (Drop All)</span>
                    </label>
                  </div>

                  {!revokeOnly && (
                    <div>
                      <div style={{ fontSize: '11px', color: '#545b64', marginBottom: '4px' }}>
                        Allowed Inbound CIDR:
                      </div>
                      <input
                        type="text"
                        value={targetCidr}
                        onChange={(e) => setTargetCidr(e.target.value)}
                        placeholder="10.0.0.0/16 or your-ip/32"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid #aab7b8',
                          borderRadius: '2px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('10.0.0.0/16')}
                          style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #eaeded', backgroundColor: '#f2f3f3', cursor: 'pointer' }}
                        >
                          VPC Subnet (10.0.0.0/16)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('192.168.1.0/24')}
                          style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #eaeded', backgroundColor: '#f2f3f3', cursor: 'pointer' }}
                        >
                          Office LAN (192.168.1.0/24)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {findingId === 'EBS-001' && (
                <div
                  style={{
                    padding: '12px 14px',
                    border: '1px solid #ceead6',
                    borderRadius: '4px',
                    backgroundColor: '#e6f4ea',
                    fontSize: '12px',
                    color: '#137333',
                  }}
                >
                  ⚡ <strong>Online Migration:</strong> Converting to <strong>gp3</strong> provides an immediate{' '}
                  <strong>20% storage cost reduction</strong> ($0.08/GB vs $0.10/GB) with guaranteed baseline 3,000 IOPS and 125 MB/s throughput without detaching the disk or rebooting instances.
                </div>
              )}

              {/* Boto3 Preview */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#545b64', marginBottom: '4px' }}>
                  AWS Boto3 API Call Preview:
                </div>
                <pre
                  style={{
                    backgroundColor: '#16191f',
                    color: '#00e5a3',
                    padding: '12px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    lineHeight: '1.4',
                  }}
                >
                  {boto3Preview}
                </pre>
              </div>

              {/* Error Box */}
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fce8e6',
                    border: '1px solid #c5221f',
                    borderRadius: '4px',
                    color: '#c5221f',
                    fontSize: '12px',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Safety Notice */}
              <div style={{ fontSize: '11px', color: '#545b64', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span>
                <span>
                  All remediations create a permanent audit log receipt and trigger CloudOps cache invalidation.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!result && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '14px 20px',
              borderTop: '1px solid #eaeded',
              backgroundColor: '#fafafa',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="aws-btn-secondary"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !selectedResource}
              className="aws-btn-primary"
              style={{
                backgroundColor: '#ec7211',
                borderColor: '#ec7211',
                minWidth: '150px',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Applying Fix...
                </>
              ) : (
                '⚡ Confirm & Apply Fix'
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
