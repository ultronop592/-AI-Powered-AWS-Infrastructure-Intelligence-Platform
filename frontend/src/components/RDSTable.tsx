'use client';

import React from 'react';
import { RDSInstance } from '../lib/api';

interface RDSTableProps {
  instances: RDSInstance[];
}

export default function RDSTable({ instances }: RDSTableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0073bb" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span>Amazon RDS Relational Database Inventory ({instances.length})</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {instances.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No RDS DB instances found in current account.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>DB Instance Identifier</th>
                  <th>Engine & Version</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Multi-AZ</th>
                  <th>Storage</th>
                  <th>Endpoint</th>
                  <th>CPU %</th>
                  <th>Connections</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((db) => (
                  <tr key={db.DBInstanceIdentifier}>
                    <td style={{ fontWeight: 600, color: '#0073bb', fontFamily: 'monospace' }}>
                      {db.DBInstanceIdentifier}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {db.Engine}
                    </td>
                    <td>
                      <span style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #eaeded',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                      }}>
                        {db.DBInstanceClass}
                      </span>
                    </td>
                    <td>
                      <span className="aws-badge aws-badge-success">
                        {db.Status}
                      </span>
                    </td>
                    <td>
                      {db.MultiAZ ? (
                        <span className="aws-badge aws-badge-success">
                          ✓ Multi-AZ Enabled
                        </span>
                      ) : (
                        <span className="aws-badge aws-badge-warning">
                          Single-AZ
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {db.AllocatedStorage} GB ({db.StorageType})
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#545b64' }}>
                      {db.Endpoint}:{db.Port}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {db.CPUUtilization}%
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {db.Connections}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
