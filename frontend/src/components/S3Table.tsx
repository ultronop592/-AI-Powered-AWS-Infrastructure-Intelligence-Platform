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
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec7211" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Amazon S3 Bucket Inventory ({buckets.length})</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {buckets.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No S3 buckets found in current account.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Bucket Name</th>
                  <th>Region</th>
                  <th>Encryption Posture</th>
                  <th>Public Access Status</th>
                  <th>Creation Date</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((b) => {
                  const isEncrypted = b.Encrypted !== false;
                  const isPublic = b.PublicAccess === true;

                  return (
                    <tr key={b.Name}>
                      <td style={{ fontWeight: 600, color: '#0073bb', fontFamily: 'monospace' }}>
                        {b.Name}
                      </td>
                      <td>{b.Region || 'us-east-1'}</td>
                      <td>
                        {isEncrypted ? (
                          <span className="aws-badge aws-badge-success">
                            ✓ AES-256 (SSE-S3)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="aws-badge aws-badge-danger">
                              ⚠️ Unencrypted
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFixEncryption(b.Name)}
                              className="aws-btn-primary"
                              style={{
                                backgroundColor: '#ec7211',
                                borderColor: '#ec7211',
                                padding: '3px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Auto-Fix
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {!isPublic ? (
                          <span className="aws-badge aws-badge-info">
                            ✓ Blocked
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="aws-badge aws-badge-danger">
                              ⚠️ Public Access
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFixPublicAccess(b.Name)}
                              className="aws-btn-primary"
                              style={{
                                backgroundColor: '#ec7211',
                                borderColor: '#ec7211',
                                padding: '3px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Auto-Fix
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ color: '#545b64', fontSize: '12px' }}>
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

      <RemediationModal
        isOpen={!!activeRec}
        recommendation={activeRec}
        onClose={() => setActiveRec(null)}
        onRemediated={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}

