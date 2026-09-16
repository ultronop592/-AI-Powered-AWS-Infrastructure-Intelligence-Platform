'use client';

import React, { useState } from 'react';
import { SecurityGroup, Recommendation } from '../lib/api';
import RemediationModal from './RemediationModal';

interface SecurityTableProps {
  securityGroups: SecurityGroup[];
  onRefresh?: () => void;
}

export default function SecurityTable({ securityGroups, onRefresh }: SecurityTableProps) {
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);

  const handleFixSecurityGroup = (sg: SecurityGroup) => {
    setActiveRec({
      id: 'SEC-001',
      severity: 'HIGH',
      category: 'Security Guardrails',
      title: `Restrict Management Ports on ${sg.GroupId}`,
      description: `Security Group ${sg.GroupId} (${sg.GroupName}) exposes inbound access from 0.0.0.0/0 on ${sg.OpenPorts.join(', ')}. Auto-fix will revoke the unrestricted rule and apply a restricted CIDR.`,
      resource_id: sg.GroupId,
      affected_resources: [sg.GroupId],
      remediation_available: true,
      remediation_action: 'RESTRICT_INGRESS_MANAGEMENT',
    });
  };
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {sg.OpenPorts.map((portStr, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  ⚠️ {portStr}
                                </span>
                              ))}
                            </div>
                            {sg.OpenPorts.some((p) => p.includes('22') || p.includes('3389') || p.includes('SSH') || p.includes('RDP')) && (
                              <button
                                type="button"
                                onClick={() => handleFixSecurityGroup(sg)}
                                className="aws-btn-primary"
                                style={{
                                  backgroundColor: '#ec7211',
                                  borderColor: '#ec7211',
                                  padding: '3px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  alignSelf: 'flex-start',
                                }}
                              >
                                ⚡ Auto-Fix
                              </button>
                            )}
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
