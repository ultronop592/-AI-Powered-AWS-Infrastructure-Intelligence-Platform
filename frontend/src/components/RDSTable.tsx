'use client';

import React from 'react';
import { RDSInstance } from '../lib/api';

interface RDSTableProps {
  instances: RDSInstance[];
}

export default function RDSTable({ instances }: RDSTableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            RDS.SYS
          </span>
          <span>Amazon RDS Relational Database Inventory ({instances.length})</span>
        </div>

        <div className="retro-controls">
          <span>_</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {instances.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            NO RDS DB INSTANCES RECORDED IN CURRENT ACCOUNT.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>IDENTIFIER</th>
                  <th>ENGINE</th>
                  <th>CLASS</th>
                  <th>STATUS</th>
                  <th>MULTI_AZ</th>
                  <th>STORAGE</th>
                  <th>ENDPOINT</th>
                  <th>CPU_%</th>
                  <th>CONNECTIONS</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((db) => (
                  <tr key={db.DBInstanceIdentifier}>
                    <td style={{ fontWeight: 700, color: '#0284c7' }}>
                      {db.DBInstanceIdentifier}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {db.Engine}
                    </td>
                    <td>
                      <span style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #0f172a',
                        padding: '1px 6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {db.DBInstanceClass}
                      </span>
                    </td>
                    <td>
                      <span className="aws-badge aws-badge-success">
                        {db.Status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {db.MultiAZ ? (
                        <span className="aws-badge aws-badge-success">
                          ✓ MULTI-AZ
                        </span>
                      ) : (
                        <span className="aws-badge aws-badge-warning">
                          SINGLE-AZ
                        </span>
                      )}
                    </td>
                    <td>
                      {db.AllocatedStorage} GB ({db.StorageType})
                    </td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>
                      {db.Endpoint}:{db.Port}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {db.CPUUtilization}%
                    </td>
                    <td>
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
