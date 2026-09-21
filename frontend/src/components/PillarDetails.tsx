'use client';

import React, { useState } from 'react';
import { ComplianceReport, ComplianceCheck } from '../lib/api';

interface PillarDetailsProps {
  compliance: ComplianceReport;
  activePillar: string;
  onSelectPillar: (pillarKey: string) => void;
}

export default function PillarDetails({
  compliance,
  activePillar,
  onSelectPillar,
}: PillarDetailsProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FAIL' | 'WARNING' | 'PASS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pillars = compliance.pillars;

  const tabs: Array<{ key: string; label: string; icon: string; count: number }> = [
    { key: 'all', label: 'ALL_PILLARS', icon: '🏛️', count: compliance.total_checks },
    { key: 'security', label: 'SECURITY', icon: '🔒', count: pillars.security?.total_checks ?? 0 },
    { key: 'cost_optimization', label: 'COST_OPT', icon: '💰', count: pillars.cost_optimization?.total_checks ?? 0 },
    { key: 'reliability', label: 'RELIABILITY', icon: '🔁', count: pillars.reliability?.total_checks ?? 0 },
    { key: 'performance_efficiency', label: 'PERFORMANCE', icon: '⚡', count: pillars.performance_efficiency?.total_checks ?? 0 },
    { key: 'operational_excellence', label: 'OPERATIONS', icon: '🛠️', count: pillars.operational_excellence?.total_checks ?? 0 },
  ];

  // Collect checks based on active pillar
  let checksToDisplay: Array<ComplianceCheck & { pillarName: string; pillarIcon: string }> = [];

  if (activePillar === 'all') {
    Object.entries(pillars).forEach(([, p]) => {
      p.checks.forEach((c) => {
        checksToDisplay.push({ ...c, pillarName: p.name, pillarIcon: p.icon });
      });
    });
  } else {
    const selected = pillars[activePillar as keyof typeof pillars];
    if (selected) {
      selected.checks.forEach((c) => {
        checksToDisplay.push({ ...c, pillarName: selected.name, pillarIcon: selected.icon });
      });
    }
  }

  // Filter by status
  if (statusFilter !== 'ALL') {
    checksToDisplay = checksToDisplay.filter((c) => c.status === statusFilter);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    checksToDisplay = checksToDisplay.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.remediation.toLowerCase().includes(q)
    );
  }

  const handleCopy = (check: ComplianceCheck) => {
    const text = `[${check.id}] ${check.name}\nDescription: ${check.description}\nRemediation: ${check.remediation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(check.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return { bg: '#ecfdf5', color: '#059669', label: 'PASS' };
      case 'WARNING':
        return { bg: '#fffbeb', color: '#d97706', label: 'WARNING' };
      case 'FAIL':
        return { bg: '#fef2f2', color: '#dc2626', label: 'FAIL' };
      default:
        return { bg: '#f8fafc', color: '#64748b', label: status };
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: '#fef2f2', color: '#dc2626' };
      case 'HIGH':
        return { bg: '#fff7ed', color: '#ea580c' };
      case 'MEDIUM':
        return { bg: '#fffbeb', color: '#d97706' };
      default:
        return { bg: '#f8fafc', color: '#64748b' };
    }
  };

  return (
    <div className="aws-card">
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #0f172a',
        backgroundColor: '#f1f5f9',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)'
      }}>
        {tabs.map((tab) => {
          const isActive = activePillar === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectPillar(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f172a',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                border: 'none',
                borderRight: '1px solid #cbd5e1',
                borderBottom: isActive ? '3px solid #ec7211' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                backgroundColor: isActive ? '#0f172a' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#0f172a',
                padding: '1px 5px',
                border: '1px solid #0f172a',
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1.5px solid #0f172a',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
        fontFamily: 'var(--font-mono)'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['ALL', 'FAIL', 'WARNING', 'PASS'] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: '1px solid #0f172a',
                  boxShadow: isActive ? '1px 1px 0px #0f172a' : 'none',
                  backgroundColor: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'ALL_CHECKS' : st === 'FAIL' ? '❌ FAIL' : st === 'WARNING' ? '⚠️ WARN' : '✅ PASS'}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="FILTER CHECK ID / NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 10px',
              fontSize: '11px',
              border: '1px solid #0f172a',
              boxShadow: '1px 1px 0px #0f172a',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Checks List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {checksToDisplay.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            NO WELL-ARCHITECTED CHECKS MATCH CURRENT FILTERS.
          </div>
        ) : (
          checksToDisplay.map((check) => {
            const statusB = getStatusBadge(check.status);
            const sevB = getSeverityBadge(check.severity);

            return (
              <div
                key={check.id}
                style={{
                  border: '1.5px solid #0f172a',
                  boxShadow: '2px 2px 0px #0f172a',
                  padding: '12px 14px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '1px 6px',
                        border: '1px solid #0f172a',
                        backgroundColor: statusB.bg,
                        color: statusB.color,
                        fontWeight: 700,
                        fontSize: '10px',
                      }}
                    >
                      {statusB.label}
                    </span>

                    <span
                      style={{
                        padding: '1px 6px',
                        border: '1px solid #0f172a',
                        backgroundColor: sevB.bg,
                        color: sevB.color,
                        fontWeight: 700,
                        fontSize: '10px',
                      }}
                    >
                      {check.severity}
                    </span>

                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                      [{check.id}]
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(check)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #0f172a',
                      boxShadow: '1px 1px 0px #0f172a',
                      padding: '2px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: '#0f172a'
                    }}
                  >
                    {copiedId === check.id ? '✓ COPIED' : 'COPY'}
                  </button>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                  {check.name}
                </div>

                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                  {check.description}
                </div>

                {check.remediation && (
                  <div style={{
                    padding: '8px 10px',
                    backgroundColor: '#fff7ed',
                    border: '1px solid #0f172a',
                    fontSize: '11px',
                    color: '#0f172a'
                  }}>
                    <strong style={{ color: '#9a3412' }}>ACTION: </strong>
                    {check.remediation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
