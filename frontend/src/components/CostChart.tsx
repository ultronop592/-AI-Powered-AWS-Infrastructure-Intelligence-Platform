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

  return (
    <div className="aws-card">
      <div className="aws-card-header">
        <span>AWS Cost Explorer Breakdown</span>
        <span style={{ fontSize: '13px', color: '#545b64', fontWeight: 500 }}>
          Month-to-Date: <strong>${totalCost.toFixed(2)} {currency}</strong>
        </span>
      </div>

      <div className="aws-card-body">
        {sortedCosts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#545b64' }}>
            No service cost data available for current period.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedCosts.map((item, index) => {
              const percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
              const barColors = ['#ec7211', '#0073bb', '#137333', '#b06000', '#6b7280'];
              const color = barColors[index % barColors.length];

              return (
                <div key={item.service} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: color
                      }}></span>
                      <span>{item.service}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#16191f' }}>${item.cost.toFixed(2)}</strong>
                      <span style={{ fontSize: '12px', color: '#545b64', marginLeft: '8px' }}>
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Clean progress bar without glow */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#eaeded',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.max(percentage, 2)}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
