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
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            SEC_GROUP.SYS
          </span>
          <span>AWS Security Groups Guardrail Audit ({securityGroups.length})</span>
        </div>

        <div className="retro-controls">
          <span>_</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {securityGroups.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            NO SECURITY GROUPS FOUND IN ACCOUNT / VPC.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>GROUP_ID &amp; NAME</th>
                  <th>RISK_LEVEL</th>
                  <th>VPC_ID</th>
                  <th>EXPOSED_PORTS</th>
                  <th>INGRESS_RULES</th>
                  <th>DESCRIPTION</th>
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
                        <div style={{ fontWeight: 700, color: '#0284c7' }}>
                          {sg.GroupId}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>
                          {sg.GroupName}
                        </div>
                      </td>

                      <td>
                        <span className={`aws-badge ${badgeClass}`}>
                          {riskLevel}
                        </span>
                      </td>

                      <td style={{ fontSize: '11px', color: '#475569' }}>
                        {sg.VpcId}
                      </td>

                      <td>
                        {sg.OpenPorts.length === 0 ? (
                          <span className="aws-badge aws-badge-success">
                            ✓ SECURED
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {sg.OpenPorts.map((portStr, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #0f172a',
                                    padding: '1px 6px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-mono)'
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
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  alignSelf: 'flex-start',
                                }}
                              >
                                ⚡ AUTO-FIX
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {sg.Rules.map((rule, idx) => (
                            <div key={idx} style={{ fontSize: '10px', color: '#0f172a' }}>
                              <strong style={{ color: rule.is_open_to_world ? '#dc2626' : '#059669' }}>
                                {rule.protocol.toUpperCase()}/{rule.port}
                              </strong>
                              {' ← '}
                              <span style={{ color: rule.is_open_to_world ? '#dc2626' : '#475569' }}>
                                {rule.cidrs.join(', ') || 'Self'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td style={{ color: '#64748b', fontSize: '11px' }}>
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
