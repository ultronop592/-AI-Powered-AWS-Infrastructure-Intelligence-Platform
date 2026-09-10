'use client';

import React from 'react';
import { EBSVolume } from '../lib/api';

interface EBSTableProps {
  volumes: EBSVolume[];
}

export default function EBSTable({ volumes }: EBSTableProps) {
  const totalSavings = volumes.reduce((acc, v) => acc + (v.GP3Eligible ? v.MonthlySavingsUSD : 0), 0);

  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <span>Amazon EBS Storage Volume Optimizer & gp2 → gp3 Advisor ({volumes.length})</span>
        </div>
        <span style={{ fontSize: '13px', color: '#137333', fontWeight: 600 }}>
          Potential gp3 Savings: <strong>${totalSavings.toFixed(2)}/mo</strong>
        </span>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {volumes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No EBS volumes found in account.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Volume ID</th>
                  <th>Size</th>
                  <th>Current Volume Type</th>
                  <th>State</th>
                  <th>Attached Instance</th>
                  <th>gp2 → gp3 Advisor</th>
                  <th>Est. Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map((vol) => {
                  const isUnattached = vol.AttachedInstance === 'Unattached' || vol.State === 'available';

                  return (
                    <tr key={vol.VolumeId}>
                      <td style={{ fontWeight: 600, color: '#0073bb', fontFamily: 'monospace' }}>
                        {vol.VolumeId}
                      </td>

                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {vol.SizeGB} GB
                      </td>

                      <td>
                        <span style={{
                          backgroundColor: vol.VolumeType === 'gp2' ? '#fef7e0' : '#e6f4ea',
                          color: vol.VolumeType === 'gp2' ? '#b06000' : '#137333',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          fontWeight: 600
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

                      <td style={{ fontFamily: 'monospace', color: isUnattached ? '#c5221f' : '#16191f' }}>
                        {vol.AttachedInstance}
                      </td>

                      <td>
                        {vol.GP3Eligible ? (
                          <span className="aws-badge aws-badge-warning">
                            ⚡ Migrate to gp3 (20% Cheaper)
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-success">
                            ✓ Optimized (gp3)
                          </span>
                        )}
                      </td>

                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: vol.MonthlySavingsUSD > 0 ? '#137333' : '#879596' }}>
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
    </div>
  );
}
