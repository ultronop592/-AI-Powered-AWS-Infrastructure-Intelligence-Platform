'use client';

import React from 'react';
import { ComplianceReport, PillarCompliance } from '../lib/api';

interface ComplianceScoreCardProps {
  compliance: ComplianceReport;
  selectedPillar?: string;
  onSelectPillar?: (pillarKey: string) => void;
}

export default function ComplianceScoreCard({
  compliance,
  selectedPillar,
  onSelectPillar,
}: ComplianceScoreCardProps) {
  const { overall_score, status, total_checks, total_passed, total_warning, total_failed, pillars } = compliance;

  const pillarEntries: Array<{ key: string; data: PillarCompliance }> = [
    { key: 'security', data: pillars.security },
    { key: 'cost_optimization', data: pillars.cost_optimization },
    { key: 'reliability', data: pillars.reliability },
    { key: 'performance_efficiency', data: pillars.performance_efficiency },
    { key: 'operational_excellence', data: pillars.operational_excellence },
  ];

  // Helper colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#137333'; // green
    if (score >= 60) return '#b06000'; // amber
    return '#c5221f'; // red
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return '#e6f4ea';
    if (score >= 60) return '#fef7e0';
    return '#fce8e6';
  };

  // Radar Chart Calculations (5 vertices)
  // Center at (175, 160), radius R = 110
  const cx = 175;
  const cy = 150;
  const r = 100;
  const numAxes = 5;

  // Compute (x, y) for angle (starting at top = -PI/2)
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const distance = r * valueRatio;
    return {
      x: cx + distance * Math.cos(angle),
      y: cy + distance * Math.sin(angle),
    };
  };

  // Background concentric pentagons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const points = Array.from({ length: numAxes }, (_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    }).join(' ');
    return { level: lvl, points };
  });

  // Benchmark 80% line
  const benchmarkPoints = Array.from({ length: numAxes }, (_, i) => {
    const { x, y } = getCoordinates(i, 0.8);
    return `${x},${y}`;
  }).join(' ');

  // Current Scores Polygon
  const dataPoints = pillarEntries.map((p, i) => {
    const ratio = Math.max(0.05, Math.min(1.0, (p.data?.score ?? 0) / 100));
    return getCoordinates(i, ratio);
  });
  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Axis Labels Positions (slightly beyond R = 100)
  const axisLabelCoords = [
    { x: cx, y: cy - r - 18, align: 'middle' }, // Security (top)
    { x: cx + r + 24, y: cy - 25, align: 'start' }, // Cost Optimization (top right)
    { x: cx + 70, y: cy + r + 22, align: 'start' }, // Reliability (bottom right)
    { x: cx - 70, y: cy + r + 22, align: 'end' }, // Performance (bottom left)
    { x: cx - r - 24, y: cy - 25, align: 'end' }, // Operational Excellence (top left)
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
      {/* Top Banner: Composite Score & Radar Visualization */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* Overall Score Summary */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '2px',
          border: '1px solid #eaeded',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 1px 0 rgba(0,28,36,0.05)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AWS Well-Architected Framework
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: getScoreBg(overall_score),
                color: getScoreColor(overall_score),
              }}>
                {status}
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#16191f', margin: '0 0 16px 0' }}>
              Cloud Compliance Scorecard
            </h2>

            {/* Score Ring / Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '16px 0' }}>
              <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="96" height="96" viewBox="0 0 96 96">
                  {/* Background Circle */}
                  <circle cx="48" cy="48" r="40" stroke="#f2f3f3" strokeWidth="8" fill="none" />
                  {/* Score Arc */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={getScoreColor(overall_score)}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - overall_score / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 48 48)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#16191f', lineHeight: 1 }}>
                    {overall_score}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#545b64' }}>/ 100</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#16191f', marginBottom: '4px' }}>
                  Weighted Multi-Pillar Posture
                </div>
                <div style={{ fontSize: '12px', color: '#545b64', lineHeight: 1.5 }}>
                  Evaluated against official AWS architectural guidance across 25+ automated infrastructure guardrails.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #eaeded',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600 }}>Total Checks</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#16191f' }}>{total_checks}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#137333', fontWeight: 600 }}>Passed</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#137333' }}>{total_passed}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#b06000', fontWeight: 600 }}>Warnings</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#b06000' }}>{total_warning}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#c5221f', fontWeight: 600 }}>Failed</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#c5221f' }}>{total_failed}</div>
            </div>
          </div>
        </div>

        {/* Radar / Spider Chart Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '2px',
          border: '1px solid #eaeded',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 1px 1px 0 rgba(0,28,36,0.05)',
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#16191f' }}>
              Pillar Balance Radar
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#545b64' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#ec7211', borderRadius: '2px', display: 'inline-block' }} />
                Current
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #137333', display: 'inline-block' }} />
                80% Target
              </span>
            </div>
          </div>

          <svg width="350" height="280" viewBox="0 0 350 280" style={{ overflow: 'visible', maxWidth: '100%' }}>
            {/* Background Grid Pentagons */}
            {gridPolygons.map((gp, i) => (
              <polygon
                key={i}
                points={gp.points}
                fill={i % 2 === 0 ? '#fafafa' : '#ffffff'}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}

            {/* Axis Spokes from center to outer vertices */}
            {Array.from({ length: numAxes }, (_, i) => {
              const outer = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Benchmark 80% polygon */}
            <polygon
              points={benchmarkPoints}
              fill="none"
              stroke="#137333"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Current Score Polygon */}
            <polygon
              points={dataPolygonString}
              fill="rgba(236, 114, 17, 0.25)"
              stroke="#ec7211"
              strokeWidth="2.5"
            />

            {/* Data Point Nodes on Vertices */}
            {dataPoints.map((pt, i) => {
              const pEntry = pillarEntries[i];
              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#ffffff"
                    stroke="#ec7211"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#16191f"
                  >
                    {pEntry.data?.score}%
                  </text>
                </g>
              );
            })}

            {/* Axis Labels */}
            {pillarEntries.map((p, i) => {
              const pos = axisLabelCoords[i];
              return (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.align as 'middle' | 'start' | 'end'}
                  fontSize="11"
                  fontWeight="600"
                  fill="#16191f"
                >
                  {p.data.icon} {p.data.name}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5 Pillar Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {pillarEntries.map(({ key, data }) => {
          const isSelected = selectedPillar === key;
          const scoreColor = getScoreColor(data.score);
          const scoreBg = getScoreBg(data.score);

          return (
            <div
              key={key}
              onClick={() => onSelectPillar && onSelectPillar(key)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '2px',
                border: isSelected ? '2px solid #ec7211' : '1px solid #eaeded',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(236,114,17,0.15)' : '0 1px 1px 0 rgba(0,28,36,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{data.icon}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: scoreBg,
                    color: scoreColor,
                  }}>
                    {data.status}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: '#16191f', marginBottom: '8px' }}>
                  {data.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: scoreColor }}>
                    {data.score}
                  </span>
                  <span style={{ fontSize: '12px', color: '#545b64', fontWeight: 600 }}>/ 100</span>
                </div>
              </div>

              <div>
                {/* Mini pass/fail progress bar */}
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#eaeded', overflow: 'hidden', display: 'flex', marginBottom: '8px' }}>
                  <div style={{ width: `${(data.pass_count / data.total_checks) * 100}%`, backgroundColor: '#137333' }} />
                  <div style={{ width: `${(data.warning_count / data.total_checks) * 100}%`, backgroundColor: '#b06000' }} />
                  <div style={{ width: `${(data.fail_count / data.total_checks) * 100}%`, backgroundColor: '#c5221f' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#545b64' }}>
                  <span>{data.pass_count} passed</span>
                  {data.fail_count > 0 && <span style={{ color: '#c5221f', fontWeight: 600 }}>{data.fail_count} failed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
