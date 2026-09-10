'use client';

import React from 'react';
import { S3Bucket, formatDateString } from '../lib/api';

interface S3TableProps {
  buckets: S3Bucket[];
}

export default function S3Table({ buckets }: S3TableProps) {
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
                  <th>Encryption</th>
                  <th>Public Access</th>
                  <th>Creation Date</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((b) => (
                  <tr key={b.Name}>
                    <td style={{ fontWeight: 600, color: '#0073bb', fontFamily: 'monospace' }}>
                      {b.Name}
                    </td>
                    <td>{b.Region || 'us-east-1'}</td>
                    <td>
                      <span className="aws-badge aws-badge-success">
                        AES-256 (SSE-S3)
                      </span>
                    </td>
                    <td>
                      <span className="aws-badge aws-badge-info">
                        Blocked
                      </span>
                    </td>
                    <td style={{ color: '#545b64', fontSize: '12px' }}>
                      {formatDateString(b.CreationDate)}
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
