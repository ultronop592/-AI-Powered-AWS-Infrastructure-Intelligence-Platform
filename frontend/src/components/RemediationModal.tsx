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
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
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
          boxShadow: '8px 8px 0px #0f172a',
          border: '2px solid #0f172a',
          backgroundColor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Retro OS Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0f172a',
            backgroundColor: '#f1f5f9',
            padding: '10px 16px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              AIOPS.EXE
            </span>
            <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
              One-Click Autonomous Remediation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b' }}>BOTO3_SDK</span>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: '#ffffff',
                border: '1px solid #0f172a',
                boxShadow: '1px 1px 0px #0f172a',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '1px 5px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-mono)' }}>
          {result ? (
            /* Result View */
            <RemediationResult result={result} onDone={handleDone} />
          ) : (
            /* Confirmation & Options Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Account Environment Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: isLive ? '#ecfdf5' : '#fffbeb',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{isLive ? '🔒' : '🧪'}</span>
                  <span style={{ fontWeight: 700, color: isLive ? '#059669' : '#d97706' }}>
                    {isLive
                      ? `LIVE TARGET: AWS ${session?.account_id} (${session?.region})`
                      : 'DEMO SIMULATION: DRY-RUN EXECUTION'}
                  </span>
                </div>
                <span className={`aws-badge ${isLive ? 'aws-badge-success' : 'aws-badge-warning'}`}>
                  {isLive ? 'LIVE BOTO3' : 'SIMULATION'}
                </span>
              </div>

              {/* Finding Summary Box */}
              <div
                style={{
                  padding: '12px 14px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      className={`aws-badge ${
                        severity === 'HIGH' || severity === 'CRITICAL' ? 'aws-badge-danger' : 'aws-badge-warning'
                      }`}
                    >
                      {severity}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                      [{findingId}]
                    </span>
                    {recommendation.category && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>• {recommendation.category}</span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {recommendation.title}
                </h4>

                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: 0 }}>
                  {recommendation.description}
                </p>
              </div>

              {/* Resource Selection Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                  [TARGET_RESOURCE_ID]:
                </label>
                {affectedList.length > 1 ? (
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1.5px solid #0f172a',
                      boxShadow: '2px 2px 0px #0f172a',
                      fontSize: '12px',
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
                      padding: '6px 10px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #0f172a',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0284c7',
                    }}
                  >
                    {selectedResource || 'AUTO-DETECTED'}
                  </div>
                )}
              </div>

              {/* Finding-Specific Customization Options */}
              {findingId === 'SEC-001' && (
                <div
                  style={{
                    padding: '12px 14px',
                    border: '1.5px solid #0f172a',
                    boxShadow: '2px 2px 0px #0f172a',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                    [INGRESS_RESTRICTION_POLICY]:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        border: '1px solid #0f172a',
                        backgroundColor: !revokeOnly ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: !revokeOnly ? 700 : 500,
                        color: '#0f172a',
                      }}
                    >
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={!revokeOnly}
                        onChange={() => setRevokeOnly(false)}
                      />
                      <span>RESTRICT TO CIDR</span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        border: '1px solid #0f172a',
                        backgroundColor: revokeOnly ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: revokeOnly ? 700 : 500,
                        color: '#0f172a',
                      }}
                    >
                      <input
                        type="radio"
                        name="remediation_mode"
                        checked={revokeOnly}
                        onChange={() => setRevokeOnly(true)}
                      />
                      <span>DROP ALL (REVOKE)</span>
                    </label>
                  </div>

                  {!revokeOnly && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        ALLOWED_INBOUND_CIDR:
                      </div>
                      <input
                        type="text"
                        value={targetCidr}
                        onChange={(e) => setTargetCidr(e.target.value)}
                        placeholder="10.0.0.0/16 or your-ip/32"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1.5px solid #0f172a',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('10.0.0.0/16')}
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            border: '1px solid #0f172a',
                            backgroundColor: '#f8fafc',
                            color: '#0f172a',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          VPC (10.0.0.0/16)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetCidr('192.168.1.0/24')}
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            border: '1px solid #0f172a',
                            backgroundColor: '#f8fafc',
                            color: '#0f172a',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          LAN (192.168.1.0/24)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {findingId === 'EBS-001' && (
                <div
                  style={{
                    padding: '10px 12px',
                    border: '1.5px solid #059669',
                    backgroundColor: '#ecfdf5',
                    fontSize: '11px',
                    color: '#065f46',
                    lineHeight: '1.4',
                  }}
                >
                  ⚡ <strong>ONLINE MIGRATION:</strong> Converting to <strong>gp3</strong> yields immediate{' '}
                  <strong>20% storage cost reduction</strong> ($0.08/GB vs $0.10/GB) with guaranteed baseline 3,000 IOPS and 125 MB/s with ZERO downtime.
                </div>
              )}

              {/* Boto3 Preview Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                    [BOTO3_API_CALL_SIGNATURE]:
                  </span>
                  <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 700 }}>
                    AWS_SDK_EXECUTION
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1.5px solid #0f172a',
                    boxShadow: '2px 2px 0px #0f172a',
                    overflow: 'hidden',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      padding: '12px',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
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
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1.5px solid #dc2626',
                    color: '#b91c1c',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Safety Notice */}
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span>
                <span>
                  Permanent audit receipt will be issued upon execution.
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
              gap: '10px',
              padding: '12px 18px',
              borderTop: '2px solid #0f172a',
              backgroundColor: '#f1f5f9',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="aws-btn-secondary"
              style={{ padding: '6px 14px' }}
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !selectedResource}
              className="aws-btn-primary"
              style={{
                backgroundColor: '#ec7211',
                padding: '6px 18px',
                minWidth: '150px',
                justifyContent: 'center',
              }}
            >
              {loading ? 'APPLYING...' : '⚡ CONFIRM & APPLY'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
