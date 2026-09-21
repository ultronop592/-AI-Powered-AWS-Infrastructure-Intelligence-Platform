'use client';

import React, { useState } from 'react';
import { MetricSeries } from '../lib/api';

interface MetricChartProps {
  title: string;
  timestamps: string[];
  series: MetricSeries;
  lineColor?: string;
  fillColor?: string;
  maxValue?: number;
}

export default function MetricChart({
  title,
  timestamps,
  series,
  lineColor = '#0284c7',
  fillColor = 'rgba(2, 132, 199, 0.08)',
  maxValue,
}: MetricChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = series.values || [];
  const maxVal = maxValue || Math.max(...values, 10);
  const minVal = 0;

  // Chart Dimensions
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate points
  const points = values.map((val, idx) => {
    const x = padding.left + (idx / Math.max(values.length - 1, 1)) * graphWidth;
    const y = padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
    return { x, y, val, time: timestamps[idx] || '' };
  });

  // SVG Path String
  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`
    : '';

  const latestVal = values.length > 0 ? values[values.length - 1] : 0;

  return (
    <div className="aws-card" style={{ flex: '1 1 450px' }}>
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', border: '1px solid #0f172a', backgroundColor: lineColor, display: 'inline-block' }}></span>
          <span>{title} ({series.unit})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            LATEST: {latestVal} {series.unit}
          </span>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: '16px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Grid Horizontal Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + graphHeight * (1 - ratio);
              const gridVal = (minVal + (maxVal - minVal) * ratio).toFixed(0);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            {areaD && <path d={areaD} fill={fillColor} />}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 5 : 3}
                fill={hoverIndex === idx ? '#ffffff' : lineColor}
                stroke="#0f172a"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'r 0.1s ease' }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}

            {/* X-Axis Timestamps */}
            {timestamps.map((t, idx) => {
              if (idx % 2 !== 0 && idx !== timestamps.length - 1) return null;
              const x = padding.left + (idx / Math.max(timestamps.length - 1, 1)) * graphWidth;
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {t}
                </text>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoverIndex !== null && points[hoverIndex] && (
            <div
              style={{
                position: 'absolute',
                left: `${(points[hoverIndex].x / width) * 100}%`,
                top: `${(points[hoverIndex].y / height) * 100 - 45}%`,
                transform: 'translateX(-50%)',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                boxShadow: '2px 2px 0px #0f172a',
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10
              }}
            >
              {points[hoverIndex].time}: {points[hoverIndex].val} {series.unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
