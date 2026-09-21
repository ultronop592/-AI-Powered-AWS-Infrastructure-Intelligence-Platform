'use client';

import React, { useState, useMemo } from 'react';
import { ServiceWasteItem } from '../lib/api';

interface WasteHeatmapProps {
  wasteData: ServiceWasteItem[];
  totalCost?: number;
}

interface TreemapRect {
  service: string;
  cost: number;
  efficiency_score: number;
  waste_score: number;
  status: string;
  top_finding: string;
  potential_savings: number;
  percentage: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function WasteHeatmap({ wasteData, totalCost = 0 }: WasteHeatmapProps) {
  const [hoveredItem, setHoveredItem] = useState<TreemapRect | null>(null);
  const [selectedItem, setSelectedItem] = useState<TreemapRect | null>(null);

  const items = useMemo(() => {
    return [...wasteData].sort((a, b) => b.cost - a.cost);
  }, [wasteData]);

  const computedTotal = useMemo(() => {
    const sum = items.reduce((acc, curr) => acc + curr.cost, 0);
    return sum > 0 ? sum : totalCost || 1;
  }, [items, totalCost]);

  const totalIdentifiedSavings = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.potential_savings || 0), 0);
  }, [items]);

  const avgEfficiency = useMemo(() => {
    if (items.length === 0) return 100;
    const weightedSum = items.reduce((acc, curr) => acc + (curr.efficiency_score * curr.cost), 0);
    return Math.round(weightedSum / computedTotal);
  }, [items, computedTotal]);

  const mostWasteful = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => a.efficiency_score - b.efficiency_score)[0];
  }, [items]);

  // Color helper based on efficiency
  const getColorScheme = (efficiency: number) => {
    if (efficiency < 30) {
      return {
        bg: '#fef2f2',
        border: '#dc2626',
        text: '#dc2626',
        badgeBg: '#dc2626',
        badgeText: '#ffffff',
        accent: '#b91c1c',
      };
    }
    if (efficiency <= 70) {
      return {
        bg: '#fffbeb',
        border: '#d97706',
        text: '#d97706',
        badgeBg: '#d97706',
        badgeText: '#ffffff',
        accent: '#b45309',
      };
    }
    return {
      bg: '#ecfdf5',
      border: '#059669',
      text: '#059669',
      badgeBg: '#059669',
      badgeText: '#ffffff',
      accent: '#047857',
    };
  };

  // 2D Treemap partition algorithm (Canvas size: 1000 x 400)
  const layoutRects: TreemapRect[] = useMemo(() => {
    const width = 1000;
    const height = 400;

    if (items.length === 0) return [];

    const rects: TreemapRect[] = [];
    const ratios = items.map((it) => it.cost / computedTotal);

    if (items.length === 1) {
      rects.push({
        ...items[0],
        percentage: 100,
        x: 0,
        y: 0,
        w: width,
        h: height,
      });
      return rects;
    }

    let sumLeft = 0;
    const leftItems: number[] = [];
    const rightItems: number[] = [];

    ratios.forEach((r, idx) => {
      if (sumLeft < 0.6 || leftItems.length === 0) {
        leftItems.push(idx);
        sumLeft += r;
      } else {
        rightItems.push(idx);
      }
    });

    if (rightItems.length === 0 && leftItems.length > 1) {
      rightItems.push(leftItems.pop()!);
      sumLeft -= ratios[rightItems[0]];
    }

    const leftWidth = Math.round(width * Math.max(0.3, Math.min(0.7, sumLeft)));
    const rightWidth = width - leftWidth;

    let currY = 0;
    leftItems.forEach((idx, i) => {
      const it = items[idx];
      const sliceH = (i === leftItems.length - 1)
        ? height - currY
        : Math.round(height * (ratios[idx] / sumLeft));
      rects.push({
        ...it,
        percentage: Math.round(ratios[idx] * 100),
        x: 0,
        y: currY,
        w: leftWidth,
        h: sliceH,
      });
      currY += sliceH;
    });

    const sumRight = 1 - sumLeft;
    currY = 0;
    rightItems.forEach((idx, i) => {
      const it = items[idx];
      const sliceH = (i === rightItems.length - 1)
        ? height - currY
        : Math.round(height * (ratios[idx] / Math.max(0.01, sumRight)));
      rects.push({
        ...it,
        percentage: Math.round(ratios[idx] * 100),
        x: leftWidth,
        y: currY,
        w: rightWidth,
        h: sliceH,
      });
      currY += sliceH;
    });

    return rects;
  }, [items, computedTotal]);

  const activeInspect = selectedItem || hoveredItem || layoutRects[0] || null;

  return (
    <div className="aws-card">
      {/* Retro OS Window Titlebar */}
      <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            FINOPS_MAP
          </span>
          <span style={{ fontWeight: 700 }}>Resource Waste &amp; Spend Efficiency Treemap</span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', border: '1px solid #0f172a', display: 'inline-block' }} />
            <span>&gt;70% EFF</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#d97706', border: '1px solid #0f172a', display: 'inline-block' }} />
            <span>30-70% WARN</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', border: '1px solid #0f172a', display: 'inline-block' }} />
            <span>&lt;30% WASTE</span>
          </span>
          <div className="retro-controls">
            <span>_</span>
            <span>□</span>
            <span>✕</span>
          </div>
        </div>
      </div>

      <div className="aws-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 3 Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{
            border: '1.5px solid #0f172a',
            boxShadow: '2px 2px 0px #0f172a',
            padding: '10px 14px',
            backgroundColor: '#fef2f2'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#991b1b', fontWeight: 700 }}>
              [IDENTIFIABLE_SAVINGS]
            </div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
              ${totalIdentifiedSavings.toFixed(2)} USD
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#991b1b', marginTop: '2px' }}>
              RECOVERABLE ACROSS EC2/EBS
            </div>
          </div>

          <div style={{
            border: '1.5px solid #0f172a',
            boxShadow: '2px 2px 0px #0f172a',
            padding: '10px 14px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#475569', fontWeight: 700 }}>
              [HIGHEST_WASTE_SOURCE]
            </div>
            <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {mostWasteful ? mostWasteful.service : 'NONE'}
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
              {mostWasteful ? `EFF: ${mostWasteful.efficiency_score}% (${mostWasteful.status})` : 'ALL EFFICIENT'}
            </div>
          </div>

          <div style={{
            border: '1.5px solid #0f172a',
            boxShadow: '2px 2px 0px #0f172a',
            padding: '10px 14px',
            backgroundColor: '#ecfdf5'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#065f46', fontWeight: 700 }}>
              [AVERAGE_EFFICIENCY]
            </div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: avgEfficiency >= 70 ? '#059669' : '#d97706', marginTop: '2px' }}>
              {avgEfficiency}%
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#065f46', marginTop: '2px' }}>
              SPEND-WEIGHTED OPTIMIZATION INDEX
            </div>
          </div>
        </div>

        {/* SVG Treemap Canvas */}
        <div style={{ width: '100%', overflowX: 'auto', border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a', backgroundColor: '#f8fafc' }}>
          <svg
            viewBox="0 0 1000 400"
            style={{ width: '100%', height: 'auto', minHeight: '340px', display: 'block' }}
          >
            {layoutRects.map((rect) => {
              const colors = getColorScheme(rect.efficiency_score);
              const isHovered = hoveredItem?.service === rect.service;
              const isSelected = selectedItem?.service === rect.service;

              const pad = 2;
              const rx = rect.x + pad;
              const ry = rect.y + pad;
              const rw = Math.max(10, rect.w - pad * 2);
              const rh = Math.max(10, rect.h - pad * 2);

              return (
                <g
                  key={rect.service}
                  onClick={() => setSelectedItem(rect)}
                  onMouseEnter={() => setHoveredItem(rect)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Treemap Cell Rectangle */}
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    fill={colors.bg}
                    stroke={isSelected ? '#ec7211' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{ transition: 'all 0.12s ease' }}
                  />

                  {/* Top Banner Stripe */}
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={Math.min(rh, 24)}
                    fill={colors.border}
                    fillOpacity="0.15"
                  />

                  {/* Text Content inside Box */}
                  {rw > 80 && rh > 40 && (
                    <>
                      <text
                        x={rx + 8}
                        y={ry + 16}
                        fontSize={rw > 180 ? '12' : '10'}
                        fontWeight="700"
                        fontFamily="var(--font-mono)"
                        fill="#0f172a"
                      >
                        {rw > 220 ? rect.service : rect.service.replace('Amazon ', '').replace('AWS ', '')}
                      </text>

                      {rh > 65 && (
                        <>
                          <text
                            x={rx + 8}
                            y={ry + 38}
                            fontSize="15"
                            fontWeight="700"
                            fontFamily="var(--font-mono)"
                            fill={colors.text}
                          >
                            ${rect.cost.toFixed(2)}
                          </text>

                          <text
                            x={rx + 8}
                            y={ry + 54}
                            fontSize="10"
                            fontWeight="600"
                            fontFamily="var(--font-mono)"
                            fill="#64748b"
                          >
                            {rect.percentage}% SPEND
                          </text>
                        </>
                      )}

                      {rh > 95 && (
                        <g transform={`translate(${rx + 8}, ${ry + 66})`}>
                          <rect
                            x="0"
                            y="0"
                            width="100"
                            height="18"
                            fill={colors.badgeBg}
                            stroke="#0f172a"
                            strokeWidth="1"
                          />
                          <text
                            x="50"
                            y="13"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="700"
                            fontFamily="var(--font-mono)"
                            fill={colors.badgeText}
                          >
                            {rect.efficiency_score}% EFF
                          </text>
                        </g>
                      )}

                      {rh > 125 && rect.potential_savings > 0 && (
                        <text
                          x={rx + 8}
                          y={ry + 105}
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="var(--font-mono)"
                          fill="#dc2626"
                        >
                          ⚡ SAVE ~${rect.potential_savings.toFixed(2)}/MO
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Inspector Box for Selected/Hovered Service */}
        {activeInspect && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            boxShadow: '2px 2px 0px #0f172a',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {activeInspect.service}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  border: '1px solid #0f172a',
                  backgroundColor: getColorScheme(activeInspect.efficiency_score).bg,
                  color: getColorScheme(activeInspect.efficiency_score).text,
                }}>
                  {activeInspect.efficiency_score}% EFF ({activeInspect.status.toUpperCase()})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
                <span>BILLED: <strong>${activeInspect.cost.toFixed(2)} USD</strong></span>
                {activeInspect.potential_savings > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>
                    POTENTIAL SAVINGS: ${activeInspect.potential_savings.toFixed(2)}/MO
                  </span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>💡 DIAGNOSTIC: </span>
              {activeInspect.top_finding}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
