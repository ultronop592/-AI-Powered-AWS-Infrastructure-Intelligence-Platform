'use client';

import React from 'react';
import { EC2Instance, formatDateString } from '../lib/api';

interface EC2TableProps {
  instances: EC2Instance[];
}

export default function EC2Table({ instances }: EC2TableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec7211" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          </svg>
          <span>Amazon EC2 Instances Inventory ({instances.length})</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {instances.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No EC2 instances found in current account/region.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Instance ID</th>
                  <th>State</th>
                  <th>Type</th>
                  <th>Public IP</th>
                  <th>Private IP</th>
                  <th>Region</th>
                  <th>Launch Time</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => {
                  const stateLower = inst.State.toLowerCase();
                  const isRunning = stateLower === 'running';

                  return (
                    <tr key={inst.InstanceId}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0073bb' }}>
                        {inst.InstanceId}
                      </td>
                      <td>
                        <span className={`aws-badge ${isRunning ? 'aws-badge-success' : 'aws-badge-danger'}`}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isRunning ? '#137333' : '#c5221f'
                          }}></span>
                          {inst.State}
                        </span>
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
                          {inst.InstanceType}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: inst.PublicIp === 'N/A' ? '#879596' : '#16191f' }}>
                        {inst.PublicIp || 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {inst.PrivateIp || 'N/A'}
                      </td>
                      <td>{inst.Region || 'us-east-1'}</td>
                      <td style={{ color: '#545b64', fontSize: '12px' }}>
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
