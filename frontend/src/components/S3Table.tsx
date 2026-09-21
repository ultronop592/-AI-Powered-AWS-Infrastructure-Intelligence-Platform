'use client';

import React, { useState } from 'react';
import { S3Bucket, Recommendation, formatDateString } from '../lib/api';
import RemediationModal from './RemediationModal';

interface S3TableProps {
  buckets: S3Bucket[];
  onRefresh?: () => void;
}

export default function S3Table({ buckets, onRefresh }: S3TableProps) {
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);

  const handleFixEncryption = (bucketName: string) => {
    setActiveRec({
      id: 'S3-001',
      severity: 'HIGH',
      category: 'S3 Security',
      title: `Enable Default Encryption on ${bucketName}`,
      description: `Bucket ${bucketName} does not have default server-side encryption enabled. Auto-fix will enforce AES-256 (SSE-S3) encryption with S3 Bucket Keys enabled.`,
      resource_id: bucketName,
      affected_resources: [bucketName],
      remediation_available: true,
      remediation_action: 'ENABLE_S3_ENCRYPTION',
    });
  };

  const handleFixPublicAccess = (bucketName: string) => {
    setActiveRec({
      id: 'S3-002',
      severity: 'HIGH',
      category: 'S3 Security',
      title: `Block Public Access on ${bucketName}`,
      description: `Bucket ${bucketName} has public access enabled. Auto-fix will turn on all 4 S3 Public Access Block settings immediately.`,
      resource_id: bucketName,
      affected_resources: [bucketName],
      remediation_available: true,
      remediation_action: 'ENABLE_S3_PUBLIC_ACCESS_BLOCK',
    });
  };

  return (
    <>
      <div className="aws-card">
        <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              S3.SYS
            </span>
            <span>Amazon S3 Bucket Storage ({buckets.length})</span>
          </div>

          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>

        <div className="aws-card-body" style={{ padding: 0 }}>
          {buckets.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              NO S3 BUCKETS DETECTED IN CURRENT ACCOUNT.
            </div>
          ) : (
            <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="aws-table">
                <thead>
                  <tr>
                    <th>BUCKET_NAME</th>
                    <th>REGION</th>
                    <th>ENCRYPTION</th>
                    <th>PUBLIC_ACCESS</th>
                    <th>CREATION_DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => {
                    const isEncrypted = b.Encrypted !== false;
                    const isPublic = b.PublicAccess === true;

                    return (
                      <tr key={b.Name}>
                        <td style={{ fontWeight: 700, color: '#0284c7' }}>
                          {b.Name}
                        </td>
                        <td>{b.Region || 'us-east-1'}</td>
                        <td>
                          {isEncrypted ? (
                            <span className="aws-badge aws-badge-success">
                              ✓ AES-256
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="aws-badge aws-badge-danger">
                                ⚠️ UNENCRYPTED
                              </span>
                              <button
                                type="button"
                                onClick={() => handleFixEncryption(b.Name)}
                                className="aws-btn-primary"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                }}
                              >
                                ⚡ AUTO-FIX
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {!isPublic ? (
                            <span className="aws-badge aws-badge-success">
                              ✓ BLOCKED
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="aws-badge aws-badge-danger">
                                🚨 PUBLIC ACCESS
                              </span>
                              <button
                                type="button"
                                onClick={() => handleFixPublicAccess(b.Name)}
                                className="aws-btn-primary"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                }}
                              >
                                ⚡ BLOCK
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '11px' }}>
                          {formatDateString(b.CreationDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Remediation Confirmation Modal */}
      <RemediationModal
        isOpen={!!activeRec}
        recommendation={activeRec}
        onClose={() => setActiveRec(null)}
        onRemediated={() => {
          setActiveRec(null);
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
