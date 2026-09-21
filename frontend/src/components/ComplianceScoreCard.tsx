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
    if (score >= 80) return '#059669'; // green
    if (score >= 60) return '#d97706'; // amber
    return '#dc2626'; // red
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return '#ecfdf5';
    if (score >= 60) return '#fffbeb';
    return '#fef2f2';
  };

  // Radar Chart Calculations (5 vertices)
  const cx = 175;
  const cy = 150;
  const r = 100;
  const numAxes = 5;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const distance = r * valueRatio;
    return {
      x: cx + distance * Math.cos(angle),
      y: cy + distance * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const points = Array.from({ length: numAxes }, (_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    }).join(' ');
    return { level: lvl, points };
  });

  const currentPoints = pillarEntries.map((p, i) => {
    const ratio = Math.max(0.05, Math.min(1.0, (p.data.score || 0) / 100));
    const { x, y } = getCoordinates(i, ratio);
    return `${x},${y}`;
  }).join(' ');

  const benchmarkPoints = Array.from({ length: numAxes }, (_, i) => {
    const { x, y } = getCoordinates(i, 0.80);
    return `${x},${y}`;
  }).join(' ');

  const labelPositions = [
    { x: cx, y: cy - r - 16, align: 'middle' },
    { x: cx + r + 18, y: cy - 25, align: 'start' },
    { x: cx + r - 5, y: cy + r - 10, align: 'start' },
    { x: cx - r + 5, y: cy + r - 10, align: 'end' },
    { x: cx - r - 18, y: cy - 25, align: 'end' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Section: Overall Score and Radar Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Overall Posture Card */}
        <div className="aws-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>
                [AWS_WELL_ARCHITECTED]
              </span>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                border: '1px solid #0f172a',
                backgroundColor: getScoreBg(overall_score),
                color: getScoreColor(overall_score),
              }}>
                {status.toUpperCase()}
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Cloud Compliance Scorecard
            </h2>

            {/* Score Ring / Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
              <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="92" height="92" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="38" stroke="#e2e8f0" strokeWidth="9" fill="none" />
                  <circle
                    cx="46"
                    cy="46"
                    r="38"
                    stroke={getScoreColor(overall_score)}
                    strokeWidth="9"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - overall_score / 100)}
                    transform="rotate(-90 46 46)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {overall_score}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>/ 100</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Weighted Multi-Pillar Posture
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  Evaluated against official AWS architectural guidance across 26 automated infrastructure guardrails.
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
            borderTop: '2px dashed #0f172a',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ textAlign: 'center', padding: '6px', border: '1px solid #0f172a', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CHECKS</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{total_checks}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px', border: '1px solid #0f172a', backgroundColor: '#ecfdf5' }}>
              <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>PASSED</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>{total_passed}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px', border: '1px solid #0f172a', backgroundColor: '#fffbeb' }}>
              <div style={{ fontSize: '10px', color: '#d97706', fontWeight: 700 }}>WARN</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#d97706' }}>{total_warning}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px', border: '1px solid #0f172a', backgroundColor: '#fef2f2' }}>
              <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>FAILED</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{total_failed}</div>
            </div>
          </div>
        </div>

        {/* Radar / Spider Chart Card */}
        <div className="aws-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
              [PILLAR_RADAR_MAP]
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#ec7211', border: '1px solid #0f172a', display: 'inline-block' }} />
                <span>CURRENT</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #059669', display: 'inline-block' }} />
                <span>80% TARGET</span>
              </span>
            </div>
          </div>

          <svg width="350" height="280" viewBox="0 0 350 280" style={{ overflow: 'visible', maxWidth: '100%' }}>
            {/* Background Grid Pentagons */}
            {gridPolygons.map((gp, i) => (
              <polygon
                key={i}
                points={gp.points}
                fill={i % 2 === 0 ? '#f8fafc' : '#ffffff'}
                stroke="#cbd5e1"
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
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Benchmark 80% polygon */}
            <polygon
              points={benchmarkPoints}
              fill="none"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Current Score Polygon */}
            <polygon
              points={currentPoints}
              fill="rgba(236, 114, 17, 0.2)"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Vertices Dots */}
            {pillarEntries.map((p, i) => {
              const ratio = Math.max(0.05, Math.min(1.0, (p.data.score || 0) / 100));
              const { x, y } = getCoordinates(i, ratio);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ec7211"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Pillar Labels */}
            {pillarEntries.map((p, i) => {
              const pos = labelPositions[i];
              return (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.align as 'middle' | 'start' | 'end'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill="#0f172a"
                >
                  {p.data.icon} {p.data.name.replace(' Efficiency', '').replace(' Optimization', '')}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5 Pillar Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
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
                border: isSelected ? '2px solid #ec7211' : '2px solid #0f172a',
                boxShadow: isSelected ? '4px 4px 0px #ec7211' : '3px 3px 0px #0f172a',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{data.icon}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    border: '1px solid #0f172a',
                    backgroundColor: scoreBg,
                    color: scoreColor,
                  }}>
                    {data.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  {data.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: scoreColor }}>
                    {data.score}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>/ 100</span>
                </div>
              </div>

              <div>
                {/* Mini pass/fail progress bar */}
                <div style={{ height: '8px', border: '1px solid #0f172a', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', marginBottom: '6px' }}>
                  <div style={{ width: `${(data.pass_count / data.total_checks) * 100}%`, backgroundColor: '#059669' }} />
                  <div style={{ width: `${(data.warning_count / data.total_checks) * 100}%`, backgroundColor: '#d97706' }} />
                  <div style={{ width: `${(data.fail_count / data.total_checks) * 100}%`, backgroundColor: '#dc2626' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  <span>{data.pass_count} PASS</span>
                  {data.fail_count > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>{data.fail_count} FAIL</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
