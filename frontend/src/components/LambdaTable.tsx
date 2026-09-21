'use client';

import React from 'react';
import { LambdaFunction } from '../lib/api';

interface LambdaTableProps {
  functions: LambdaFunction[];
}

export default function LambdaTable({ functions }: LambdaTableProps) {
  return (
    <div className="aws-card">
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            LAMBDA.FAAS
          </span>
          <span>AWS Lambda Serverless Functions Analytics ({functions.length})</span>
        </div>

        <div className="retro-controls">
          <span>_</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: 0 }}>
        {functions.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            NO LAMBDA FUNCTIONS FOUND IN CURRENT ACCOUNT.
          </div>
        ) : (
          <div className="aws-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="aws-table">
              <thead>
                <tr>
                  <th>FUNCTION_NAME</th>
                  <th>RUNTIME</th>
                  <th>ALLOCATED_MEMORY</th>
                  <th>EFFICIENCY</th>
                  <th>AVG_DURATION</th>
                  <th>COLD_START</th>
                  <th>ERROR_RATE</th>
                  <th>CODE_SIZE</th>
                </tr>
              </thead>
              <tbody>
                {functions.map((fn) => {
                  const isOverprovisioned = fn.MemorySize >= 1024 && fn.MemoryEfficiencyPercent < 35;

                  return (
                    <tr key={fn.FunctionName}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>
                        {fn.FunctionName}
                      </td>

                      <td>
                        <span style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #0f172a',
                          padding: '1px 6px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}>
                          {fn.Runtime}
                        </span>
                      </td>

                      <td>
                        {fn.MemorySize} MB
                      </td>

                      <td>
                        {isOverprovisioned ? (
                          <span className="aws-badge aws-badge-warning">
                            ⚠️ {fn.MemoryEfficiencyPercent}% OVER-PROV
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-success">
                            {fn.MemoryEfficiencyPercent}% EFF
                          </span>
                        )}
                      </td>

                      <td>
                        {fn.AvgDurationMs} ms
                      </td>

                      <td>
                        {fn.ColdStartMs} ms
                      </td>

                      <td>
                        {fn.ErrorRatePercent === 0 ? (
                          <span className="aws-badge aws-badge-success">
                            0% ERR
                          </span>
                        ) : (
                          <span className="aws-badge aws-badge-danger">
                            {fn.ErrorRatePercent}% ERR
                          </span>
                        )}
                      </td>

                      <td style={{ color: '#64748b' }}>
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
