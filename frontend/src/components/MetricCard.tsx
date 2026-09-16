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
    <div
      className="aws-card"
      style={{
        flex: '1 1 220px',
        position: 'relative',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          height: '3px',
          backgroundColor: accentColor,
          width: '100%',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: `${accentColor}14`,
                border: `1px solid ${accentColor}28`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
        </div>

        <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          {value}
        </div>

        {(subtitle || trend) && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            {trend && (
              <span
                style={{
                  backgroundColor: trend === 'PASS' || trend.includes('Savings') ? '#ecfdf5' : '#fef2f2',
                  color: trend === 'PASS' || trend.includes('Savings') ? '#059669' : '#dc2626',
                  border: `1px solid ${trend === 'PASS' || trend.includes('Savings') ? '#a7f3d0' : '#fecaca'}`,
                  padding: '1px 7px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                {trend}
              </span>
            )}
            {subtitle && (
              <span style={{ color: '#64748b', fontSize: '12px' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
