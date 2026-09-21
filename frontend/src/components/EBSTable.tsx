'use client';

import React, { useState } from 'react';
import { EBSVolume, Recommendation } from '../lib/api';
import RemediationModal from './RemediationModal';

interface EBSTableProps {
  volumes: EBSVolume[];
  onRefresh?: () => void;
}

export default function EBSTable({ volumes, onRefresh }: EBSTableProps) {
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);
  const totalSavings = volumes.reduce((acc, v) => acc + (v.GP3Eligible ? v.MonthlySavingsUSD : 0), 0);

  const handleFixVolume = (vol: EBSVolume) => {
    setActiveRec({
      id: 'EBS-001',
      severity: 'MEDIUM',
      category: 'EBS Storage Optimization',
      title: `Migrate ${vol.VolumeId} to gp3`,
      description: `EBS volume ${vol.VolumeId} (${vol.SizeGB} GB) is currently using legacy gp2 storage. Converting to gp3 saves ~20% ($0.02/GB) with baseline 3,000 IOPS and 125 MB/s throughput.`,
      resource_id: vol.VolumeId,
      affected_resources: [vol.VolumeId],
      remediation_available: true,
      remediation_action: 'UPGRADE_EBS_GP3',
    });
  };

  return (
    <div className="aws-card">
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#d97706',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            EBS.SYS
          </span>
          <span>Amazon EBS Storage Volume Optimizer ({volumes.length})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            GP3_SAVINGS: +${totalSavings.toFixed(2)}/MO
          </span>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {volumes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            NO EBS BLOCK VOLUMES RECORDED IN CURRENT REGION.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>VOLUME_ID</th>
                  <th>SIZE</th>
                  <th>VOLUME_TYPE</th>
                  <th>STATE</th>
                  <th>ATTACHED_INSTANCE</th>
                  <th>GP3_ADVISOR</th>
                  <th>EST_SAVINGS</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map((vol) => {
                  const isUnattached = vol.AttachedInstance === 'Unattached' || vol.State === 'available';

                  return (
                    <tr key={vol.VolumeId}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>
                        {vol.VolumeId}
                      </td>

                      <td style={{ fontWeight: 700 }}>
                        {vol.SizeGB} GB
                      </td>

                      <td>
                        <span style={{
                          backgroundColor: vol.VolumeType === 'gp2' ? '#fffbeb' : '#ecfdf5',
                          color: vol.VolumeType === 'gp2' ? '#d97706' : '#059669',
                          border: '1px solid #0f172a',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}>
                          {vol.VolumeType.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {isUnattached ? (
                          <span className="aws-badge aws-badge-danger">
                            ⚠️ UNATTACHED
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-success">
                            IN-USE
                          </span>
                        )}
                      </td>

                      <td style={{ color: isUnattached ? '#dc2626' : '#0f172a', fontWeight: isUnattached ? 700 : 500 }}>
                        {vol.AttachedInstance}
                      </td>

                      <td>
                        {vol.GP3Eligible ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="aws-badge aws-badge-warning">
                              GP2 (LEGACY)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFixVolume(vol)}
                              className="aws-btn-primary"
                              style={{
                                padding: '2px 8px',
                                fontSize: '10px',
                              }}
                            >
                              ⚡ CONVERT
                            </button>
                          </div>
                        ) : (
                          <span className="aws-badge aws-badge-success">
                            ✓ GP3 OPTIMAL
                          </span>
                        )}
                      </td>

                      <td style={{ fontWeight: 700, color: vol.MonthlySavingsUSD > 0 ? '#059669' : '#64748b' }}>
                        {vol.MonthlySavingsUSD > 0 ? `+$${vol.MonthlySavingsUSD.toFixed(2)}/mo` : '$0.00'}
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
