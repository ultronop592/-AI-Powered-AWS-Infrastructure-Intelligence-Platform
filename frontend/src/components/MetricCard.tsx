'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = '#ec7211',
}: MetricCardProps) {
  return (
    <div className="aws-card" style={{ flex: '1 1 220px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        height: '3px',
        backgroundColor: accentColor,
        width: '100%'
      }}></div>
      <div className="aws-card-body" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#545b64' }}>
            {title}
          </span>
          {icon && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #eaeded',
              color: accentColor,
              display: 'flex',
              alignItems: 'center'
            }}>
              {icon}
            </div>
          )}
        </div>

        <div style={{ fontSize: '26px', fontWeight: 700, color: '#16191f', letterSpacing: '-0.5px' }}>
          {value}
        </div>

        {(subtitle || trend) && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            {trend && (
              <span style={{
                backgroundColor: '#e6f4ea',
                color: '#137333',
                padding: '2px 6px',
                borderRadius: '2px',
                fontWeight: 600,
                fontSize: '11px'
              }}>
                {trend}
              </span>
            )}
            {subtitle && (
              <span style={{ color: '#545b64' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
