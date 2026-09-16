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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(4px)',
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
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '16px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                One-Click Auto-Remediation
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
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
              color: '#94a3b8',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              lineHeight: 1,
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
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
                  borderRadius: '8px',
                  backgroundColor: isLive ? '#ecfdf5' : '#fffbeb',
                  border: isLive ? '1px solid #a7f3d0' : '1px solid #fde68a',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{isLive ? '🔒' : '🧪'}</span>
                  <span style={{ fontWeight: 600, color: isLive ? '#059669' : '#d97706' }}>
                    {isLive
                      ? `Connected to AWS Account ${session?.account_id} (${session?.region})`
                      : 'Demo Simulation Mode (Safe dry-run preview)'}
                  </span>
                </div>
                <span className={`aws-badge ${isLive ? 'aws-badge-success' : 'aws-badge-warning'}`}>
                  {isLive ? 'LIVE BOTO3' : 'DEMO MODE'}
                </span>
              </div>

              {/* Finding Summary Box */}
              <div
                style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
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
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
                      {findingId}
                    </span>
                    {recommendation.category && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>• {recommendation.category}</span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {recommendation.title}
                </h4>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  {recommendation.description}
                </p>
              </div>

              {/* Resource Selection Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Target AWS Resource:
                </label>
                {affectedList.length > 1 ? (
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
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
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0284c7',
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
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    SSH/RDP Ingress Restriction Policy:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: !revokeOnly ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        backgroundColor: !revokeOnly ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: !revokeOnly ? 600 : 400,
                        color: !revokeOnly ? '#0369a1' : '#475569',
                      }}
                    >
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={!revokeOnly}
                        onChange={() => setRevokeOnly(false)}
                      />
                      <span>Restrict to Trusted CIDR</span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: revokeOnly ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        backgroundColor: revokeOnly ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: revokeOnly ? 600 : 400,
                        color: revokeOnly ? '#0369a1' : '#475569',
                      }}
                    >
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={revokeOnly}
                        onChange={() => setRevokeOnly(true)}
                      />
                      <span>Drop All (Revoke 0.0.0.0/0)</span>
                    </label>
                  </div>

                  {!revokeOnly && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
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
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('10.0.0.0/16')}
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          VPC Subnet (10.0.0.0/16)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('192.168.1.0/24')}
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
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
                    padding: '14px 16px',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    fontSize: '13px',
                    color: '#065f46',
                    lineHeight: '1.5',
                  }}
                >
                  ⚡ <strong>Online Migration:</strong> Converting to <strong>gp3</strong> provides an immediate{' '}
                  <strong>20% storage cost reduction</strong> ($0.08/GB vs $0.10/GB) with guaranteed baseline 3,000 IOPS and 125 MB/s throughput without detaching the volume or restarting instances.
                </div>
              )}

              {/* Boto3 Preview Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                    Boto3 Python SDK Call Preview:
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    AWS EC2 / S3 API
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    overflow: 'hidden',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      padding: '14px',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      overflowX: 'auto',
                      lineHeight: '1.5',
                    }}
                  >
                    {boto3Preview}
                  </pre>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '13px',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Safety Notice */}
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              padding: '14px 22px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
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
                minWidth: '160px',
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
