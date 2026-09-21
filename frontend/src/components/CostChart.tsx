'use client';

import React from 'react';
import { CostItem } from '../lib/api';

interface CostChartProps {
  costByService: CostItem[];
  totalCost: number;
  currency?: string;
}

export default function CostChart({ costByService, totalCost, currency = 'USD' }: CostChartProps) {
  const sortedCosts = [...costByService].sort((a, b) => b.cost - a.cost);

  // Curated color palette for AWS services
  const getServiceColor = (name: string, idx: number) => {
    const lower = name.toLowerCase();
    if (lower.includes('ec2') || lower.includes('elastic compute')) return '#ec7211'; // AWS Orange
    if (lower.includes('ebs') || lower.includes('block store')) return '#d97706'; // Amber
    if (lower.includes('s3') || lower.includes('simple storage')) return '#059669'; // Emerald
    if (lower.includes('rds') || lower.includes('relational')) return '#0284c7'; // Sky Blue
    if (lower.includes('lambda')) return '#dc2626'; // Red
    if (lower.includes('kms') || lower.includes('key management')) return '#7c3aed'; // Purple
    if (lower.includes('cloudwatch') || lower.includes('telemetry')) return '#475569'; // Slate
    const palette = ['#ec7211', '#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626'];
    return palette[idx % palette.length];
  };

  const topService = sortedCosts[0];

  return (
    <div className="aws-card">
      {/* Retro OS Window Titlebar */}
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            COST.DAT
          </span>
          <span>AWS Spend &amp; FinOps Breakdown</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 700 }}>
            MTD: ${totalCost.toFixed(2)} {currency}
          </span>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: '16px' }}>
        {sortedCosts.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'var(--font-mono)',
            border: '1.5px dashed #cbd5e1'
          }}>
            NO SERVICE COST DATA RECORDED FOR CURRENT BILLING PERIOD.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sortedCosts.map((item, index) => {
              const percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
              const color = getServiceColor(item.service, index);

              return (
                <div key={item.service} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        border: '1px solid #0f172a',
                        backgroundColor: color,
                        display: 'inline-block'
                      }}></span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.service}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '12px' }}>
                        ${item.cost.toFixed(2)}
                      </strong>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        padding: '1px 5px',
                        border: '1px solid #0f172a',
                        boxShadow: '1px 1px 0px #0f172a'
                      }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Sharp Neo-Brutalist Gauge */}
                  <div style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #0f172a',
                    boxShadow: '1px 1px 0px #0f172a',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.max(percentage, 2)}%`,
                      height: '100%',
                      backgroundColor: color,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}

            {/* Bottom FinOps Quick Insight Chip */}
            {topService && (
              <div style={{
                marginTop: '6px',
                padding: '10px 12px',
                backgroundColor: '#fff7ed',
                border: '1.5px solid #0f172a',
                boxShadow: '2px 2px 0px #0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>
                  ⚡ TOP EXPENSE: {topService.service} (${topService.cost.toFixed(2)})
                </span>
                <span style={{ color: '#475569' }}>
                  RUN_RATE: ~${(totalCost * 1.1).toFixed(2)}/MO
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
