'use client';

import React from 'react';
import { SecurityGroup } from '../lib/api';

interface SecurityTableProps {
  securityGroups: SecurityGroup[];
}

export default function SecurityTable({ securityGroups }: SecurityTableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c5221f" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>AWS Security Groups Guardrail Audit ({securityGroups.length})</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {securityGroups.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No Security Groups found in account/VPC.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Group ID & Name</th>
                  <th>Risk Level</th>
                  <th>VPC ID</th>
                  <th>Exposed Open Ports</th>
                  <th>Inbound Ingress Rules</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {securityGroups.map((sg) => {
                  const riskLevel = sg.RiskLevel.toUpperCase();
                  let badgeClass = 'aws-badge-info';
                  if (riskLevel === 'CRITICAL') badgeClass = 'aws-badge-danger';
                  if (riskLevel === 'HIGH') badgeClass = 'aws-badge-warning';

                  return (
                    <tr key={sg.GroupId}>
                      <td>
                        <div style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0073bb' }}>
                          {sg.GroupId}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16191f', fontWeight: 500 }}>
                          {sg.GroupName}
                        </div>
                      </td>

                      <td>
                        <span className={`aws-badge ${badgeClass}`}>
                          {riskLevel} RISK
                        </span>
                      </td>

                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#545b64' }}>
                        {sg.VpcId}
                      </td>

                      <td>
                        {sg.OpenPorts.length === 0 ? (
                          <span className="aws-badge aws-badge-success">
                            ✓ No Open 0.0.0.0/0 Ports
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {sg.OpenPorts.map((portStr, idx) => (
                              <span
                                key={idx}
                                style={{
                                  backgroundColor: '#fce8e6',
                                  color: '#c5221f',
                                  border: '1px solid rgba(197,34,31,0.2)',
                                  padding: '2px 6px',
                                  borderRadius: '2px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  fontFamily: 'monospace'
                                }}
                              >
                                ⚠️ {portStr}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {sg.Rules.map((rule, idx) => (
                            <div key={idx} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#16191f' }}>
                              <strong style={{ color: rule.is_open_to_world ? '#c5221f' : '#137333' }}>
                                {rule.protocol.toUpperCase()}/{rule.port}
                              </strong>
                              {' ← '}
                              <span style={{ color: rule.is_open_to_world ? '#c5221f' : '#545b64' }}>
                                {rule.cidrs.join(', ') || 'Self'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td style={{ color: '#545b64', fontSize: '12px' }}>
                        {sg.Description || 'N/A'}
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
