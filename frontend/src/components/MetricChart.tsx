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
  lineColor = '#0073bb',
  fillColor = 'rgba(0, 115, 187, 0.08)',
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
      <div className="aws-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: lineColor }}></span>
          <span>{title} ({series.unit})</span>
        </div>
        <span style={{ fontSize: '13px', color: '#16191f', fontWeight: 700 }}>
          Latest: {latestVal} {series.unit}
        </span>
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
                    stroke="#eaeded"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 4}
                    fill="#879596"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                stroke={lineColor}
                strokeWidth={hoverIndex === idx ? 3 : 1}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
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
                  fill="#879596"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
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
                backgroundColor: '#16191f',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 10
              }}
            >
              <strong>{points[hoverIndex].time}</strong>: {points[hoverIndex].val} {series.unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
