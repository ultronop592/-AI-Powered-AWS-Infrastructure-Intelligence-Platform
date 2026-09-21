'use client';

import React from 'react';
import { EC2Instance, formatDateString } from '../lib/api';

interface EC2TableProps {
  instances: EC2Instance[];
}

export default function EC2Table({ instances }: EC2TableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700,
          }}>
            EC2.SYS
          </span>
          <span>Amazon EC2 Compute Instances ({instances.length})</span>
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
            NO EC2 COMPUTE INSTANCES DETECTED IN CURRENT REGION.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>INSTANCE_ID</th>
                  <th>STATE</th>
                  <th>TYPE</th>
                  <th>PUBLIC_IP</th>
                  <th>PRIVATE_IP</th>
                  <th>REGION</th>
                  <th>LAUNCH_TIME</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => {
                  const stateLower = inst.State.toLowerCase();
                  const isRunning = stateLower === 'running';

                  return (
                    <tr key={inst.InstanceId}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>
                        {inst.InstanceId}
                      </td>
                      <td>
                        <span className={`aws-badge ${isRunning ? 'aws-badge-success' : 'aws-badge-danger'}`}>
                          {inst.State.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #0f172a',
                          padding: '1px 6px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {inst.InstanceType}
                        </span>
                      </td>
                      <td style={{ color: inst.PublicIp === 'N/A' ? '#94a3b8' : '#0f172a' }}>
                        {inst.PublicIp || 'N/A'}
                      </td>
                      <td>
                        {inst.PrivateIp || 'N/A'}
                      </td>
                      <td>{inst.Region || 'us-east-1'}</td>
                      <td style={{ color: '#64748b', fontSize: '11px' }}>
                        {formatDateString(inst.LaunchTime)}
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
