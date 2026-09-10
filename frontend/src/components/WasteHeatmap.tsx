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
        bg: '#fce8e6',
        border: '#c5221f',
        text: '#c5221f',
        badgeBg: '#c5221f',
        badgeText: '#ffffff',
        accent: '#d93025',
      };
    }
    if (efficiency <= 70) {
      return {
        bg: '#fef7e0',
        border: '#b06000',
        text: '#b06000',
        badgeBg: '#f9ab00',
        badgeText: '#202124',
        accent: '#f9ab00',
      };
    }
    return {
      bg: '#e6f4ea',
      border: '#137333',
      text: '#137333',
      badgeBg: '#137333',
      badgeText: '#ffffff',
      accent: '#1e8e3e',
    };
  };

  // 2D Treemap partition algorithm (Canvas size: 1000 x 420)
  const layoutRects: TreemapRect[] = useMemo(() => {
    const width = 1000;
    const height = 400;

    if (items.length === 0) return [];

    const rects: TreemapRect[] = [];
    const ratios = items.map((it) => it.cost / computedTotal);

    // If only 1 item
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

    // Binary / Slice-and-dice layout
    // Partition list into left column (dominant items ~60% cost) and right column (~40%)
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

    // Lay out left column vertically
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

    // Lay out right column vertically (or grid if >= 3 items)
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
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '2px',
      border: '1px solid #eaeded',
      padding: '20px',
      boxShadow: '0 1px 1px 0 rgba(0,28,36,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header & FinOps KPI Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#16191f', margin: 0 }}>
              FinOps Resource Waste & Cost Efficiency Heatmap
            </h2>
            <p style={{ fontSize: '12px', color: '#545b64', margin: '4px 0 0 0' }}>
              Treemap bounding box size reflects monthly spend. Color indicates cost efficiency (Green: Efficient, Yellow: Needs Attention, Red: Wasteful).
            </p>
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#545b64' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#e6f4ea', border: '1px solid #137333', borderRadius: '2px', display: 'inline-block' }} />
              <strong>Efficient (&gt;70%)</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#fef7e0', border: '1px solid #b06000', borderRadius: '2px', display: 'inline-block' }} />
              <strong>Warning (30-70%)</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#fce8e6', border: '1px solid #c5221f', borderRadius: '2px', display: 'inline-block' }} />
              <strong>Wasteful (&lt;30%)</strong>
            </span>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ border: '1px solid #eaeded', borderRadius: '2px', padding: '12px', backgroundColor: '#fafafa' }}>
            <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600 }}>Identifiable Monthly Savings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#c5221f', marginTop: '2px' }}>
              ${totalIdentifiedSavings.toFixed(2)} USD
            </div>
            <div style={{ fontSize: '11px', color: '#545b64', marginTop: '2px' }}>
              Immediate waste recoverable across EBS & EC2
            </div>
          </div>

          <div style={{ border: '1px solid #eaeded', borderRadius: '2px', padding: '12px', backgroundColor: '#fafafa' }}>
            <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600 }}>Highest Waste Contributor</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#16191f', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {mostWasteful ? mostWasteful.service : 'None'}
            </div>
            <div style={{ fontSize: '11px', color: '#c5221f', fontWeight: 600, marginTop: '2px' }}>
              {mostWasteful ? `Efficiency: ${mostWasteful.efficiency_score}% (${mostWasteful.status})` : 'All efficient'}
            </div>
          </div>

          <div style={{ border: '1px solid #eaeded', borderRadius: '2px', padding: '12px', backgroundColor: '#fafafa' }}>
            <div style={{ fontSize: '11px', color: '#545b64', fontWeight: 600 }}>Average Spend Efficiency</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: avgEfficiency >= 70 ? '#137333' : '#b06000', marginTop: '2px' }}>
              {avgEfficiency}%
            </div>
            <div style={{ fontSize: '11px', color: '#545b64', marginTop: '2px' }}>
              Spend-weighted cloud optimization index
            </div>
          </div>
        </div>
      </div>

      {/* SVG Treemap Canvas */}
      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #eaeded', borderRadius: '2px', backgroundColor: '#f9f9f9' }}>
        <svg
          viewBox="0 0 1000 400"
          style={{ width: '100%', height: 'auto', minHeight: '380px', display: 'block' }}
        >
          {layoutRects.map((rect) => {
            const colors = getColorScheme(rect.efficiency_score);
            const isHovered = hoveredItem?.service === rect.service;
            const isSelected = selectedItem?.service === rect.service;

            const pad = 3;
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
                  rx="3"
                  fill={colors.bg}
                  stroke={isSelected ? '#ec7211' : (isHovered ? colors.accent : colors.border)}
                  strokeWidth={isSelected ? 3 : (isHovered ? 2.5 : 1)}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Top Banner Stripe */}
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={Math.min(rh, 26)}
                  rx="3"
                  fill={colors.border}
                  fillOpacity="0.12"
                />

                {/* Text Content inside Box (Only if box is large enough) */}
                {rw > 80 && rh > 45 && (
                  <>
                    <text
                      x={rx + 10}
                      y={ry + 18}
                      fontSize={rw > 180 ? '13' : '11'}
                      fontWeight="700"
                      fill="#16191f"
                    >
                      {rw > 220 ? rect.service : rect.service.replace('Amazon ', '').replace('AWS ', '')}
                    </text>

                    {rh > 70 && (
                      <>
                        <text
                          x={rx + 10}
                          y={ry + 42}
                          fontSize="16"
                          fontWeight="800"
                          fill={colors.text}
                        >
                          ${rect.cost.toFixed(2)}
                        </text>

                        <text
                          x={rx + 10}
                          y={ry + 58}
                          fontSize="11"
                          fontWeight="600"
                          fill="#545b64"
                        >
                          {rect.percentage}% of total spend
                        </text>
                      </>
                    )}

                    {rh > 105 && (
                      <g transform={`translate(${rx + 10}, ${ry + 74})`}>
                        <rect
                          x="0"
                          y="0"
                          width="110"
                          height="20"
                          rx="2"
                          fill={colors.badgeBg}
                        />
                        <text
                          x="55"
                          y="14"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill={colors.badgeText}
                        >
                          {rect.efficiency_score}% Efficient
                        </text>
                      </g>
                    )}

                    {rh > 135 && rect.potential_savings > 0 && (
                      <text
                        x={rx + 10}
                        y={ry + 115}
                        fontSize="11"
                        fontWeight="700"
                        fill="#c5221f"
                      >
                        ⚡ Save ~${rect.potential_savings.toFixed(2)}/mo
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
          backgroundColor: '#fafafa',
          border: '1px solid #eaeded',
          borderRadius: '2px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#16191f' }}>
                {activeInspect.service}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: getColorScheme(activeInspect.efficiency_score).bg,
                color: getColorScheme(activeInspect.efficiency_score).text,
              }}>
                {activeInspect.efficiency_score}% Efficient ({activeInspect.status})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span>Billed Spend: <strong>${activeInspect.cost.toFixed(2)} USD</strong></span>
              {activeInspect.potential_savings > 0 && (
                <span style={{ color: '#c5221f', fontWeight: 700 }}>
                  Potential Monthly Savings: ${activeInspect.potential_savings.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#545b64', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: '#16191f' }}>💡 FinOps Diagnostic: </span>
            {activeInspect.top_finding}
          </div>
        </div>
      )}
    </div>
  );
}
