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
  const isPositiveTrend = trend === 'PASS' || (trend && (trend.includes('Savings') || trend.includes('+') || trend.includes('PASS')));
  const isDangerTrend = trend === 'RISK DETECTED' || (trend && (trend.includes('FAIL') || trend.includes('CRITICAL')));

  return (
    <div
      className="aws-card"
      style={{
        flex: '1 1 210px',
        position: 'relative',
        border: '2px solid #0f172a',
        backgroundColor: '#ffffff',
        boxShadow: '4px 4px 0px #0f172a',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Retro Accent Bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: accentColor,
          width: '100%',
          borderBottom: '2px solid #0f172a',
        }}
      />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Card Top: Title & Icon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              [{title}]
            </span>
            {icon && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '1.5px solid #0f172a',
                  boxShadow: '1.5px 1.5px 0px #0f172a',
                  backgroundColor: '#f8fafc',
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

          {/* Large Monospace Metric Value */}
          <div style={{
            fontSize: '23px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
            margin: '4px 0 8px 0',
          }}>
            {value}
          </div>
        </div>

        {/* Bottom Metadata & Trend Badge */}
        {(subtitle || trend) && (
          <div style={{
            paddingTop: '8px',
            borderTop: '1px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}>
            {trend && (
              <span
                style={{
                  backgroundColor: isPositiveTrend ? '#ecfdf5' : isDangerTrend ? '#fef2f2' : '#fffbeb',
                  color: isPositiveTrend ? '#059669' : isDangerTrend ? '#dc2626' : '#d97706',
                  border: '1px solid #0f172a',
                  boxShadow: '1px 1px 0px #0f172a',
                  padding: '1px 6px',
                  fontWeight: 700,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                {trend}
              </span>
            )}
            {subtitle && (
              <span style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
