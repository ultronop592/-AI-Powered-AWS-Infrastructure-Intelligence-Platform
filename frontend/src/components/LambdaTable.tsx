'use client';

import React from 'react';
import { LambdaFunction } from '../lib/api';

interface LambdaTableProps {
  functions: LambdaFunction[];
}

export default function LambdaTable({ functions }: LambdaTableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec7211" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>AWS Lambda Serverless Functions Analytics ({functions.length})</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {functions.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No Lambda functions found in current account.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Function Name</th>
                  <th>Runtime</th>
                  <th>Allocated Memory</th>
                  <th>Memory Efficiency</th>
                  <th>Avg Duration</th>
                  <th>Cold Start Latency</th>
                  <th>Error Rate</th>
                  <th>Code Package</th>
                </tr>
              </thead>
              <tbody>
                {functions.map((fn) => {
                  const isOverprovisioned = fn.MemorySize >= 1024 && fn.MemoryEfficiencyPercent < 35;

                  return (
                    <tr key={fn.FunctionName}>
                      <td style={{ fontWeight: 600, color: '#0073bb', fontFamily: 'monospace' }}>
                        {fn.FunctionName}
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
                          {fn.Runtime}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'monospace' }}>
                        {fn.MemorySize} MB
                      </td>

                      <td>
                        {isOverprovisioned ? (
                          <span className="aws-badge aws-badge-warning">
                            ⚠️ {fn.MemoryEfficiencyPercent}% (Over-allocated)
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-success">
                            {fn.MemoryEfficiencyPercent}% Efficient
                          </span>
                        )}
                      </td>

                      <td style={{ fontFamily: 'monospace' }}>
                        {fn.AvgDurationMs} ms
                      </td>

                      <td style={{ fontFamily: 'monospace', color: '#545b64' }}>
                        {fn.ColdStartMs} ms
                      </td>

                      <td>
                        {fn.ErrorRatePercent === 0 ? (
                          <span className="aws-badge aws-badge-success">
                            0% Errors
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-danger">
                            {fn.ErrorRatePercent}% Errors
                          </span>
                        )}
                      </td>

                      <td style={{ fontFamily: 'monospace', color: '#545b64', fontSize: '12px' }}>
                        {fn.CodeSize} MB
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
