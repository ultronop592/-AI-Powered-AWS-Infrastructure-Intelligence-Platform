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
    { key: 'all', label: 'All Pillars', icon: '🏛️', count: compliance.total_checks },
    { key: 'security', label: 'Security', icon: '🔒', count: pillars.security?.total_checks ?? 0 },
    { key: 'cost_optimization', label: 'Cost Optimization', icon: '💰', count: pillars.cost_optimization?.total_checks ?? 0 },
    { key: 'reliability', label: 'Reliability', icon: '🔁', count: pillars.reliability?.total_checks ?? 0 },
    { key: 'performance_efficiency', label: 'Performance', icon: '⚡', count: pillars.performance_efficiency?.total_checks ?? 0 },
    { key: 'operational_excellence', label: 'Operational Excellence', icon: '🛠️', count: pillars.operational_excellence?.total_checks ?? 0 },
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
        return { bg: '#e6f4ea', color: '#137333', label: 'PASS' };
      case 'WARNING':
        return { bg: '#fef7e0', color: '#b06000', label: 'WARNING' };
      case 'FAIL':
        return { bg: '#fce8e6', color: '#c5221f', label: 'FAIL' };
      default:
        return { bg: '#f2f3f3', color: '#545b64', label: status };
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: '#c5221f', color: '#ffffff' };
      case 'HIGH':
        return { bg: '#e8710a', color: '#ffffff' };
      case 'MEDIUM':
        return { bg: '#f9ab00', color: '#202124' };
      default:
        return { bg: '#eaeded', color: '#545b64' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '2px',
      border: '1px solid #eaeded',
      boxShadow: '0 1px 1px 0 rgba(0,28,36,0.05)',
      overflow: 'hidden',
    }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eaeded',
        backgroundColor: '#fafafa',
        overflowX: 'auto',
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
                gap: '8px',
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ec7211' : '#545b64',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #ec7211' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                fontSize: '11px',
                backgroundColor: isActive ? '#ec7211' : '#e0e0e0',
                color: isActive ? '#ffffff' : '#545b64',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 600,
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaeded',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#ffffff',
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'FAIL', 'WARNING', 'PASS'] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '2px',
                  border: isActive ? '1px solid #ec7211' : '1px solid #d5dbdb',
                  backgroundColor: isActive ? '#fef8f3' : '#ffffff',
                  color: isActive ? '#ec7211' : '#545b64',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All Findings' : st === 'FAIL' ? '❌ Failed' : st === 'WARNING' ? '⚠️ Warnings' : '✅ Passed'}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Filter by check, ID, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #aab7b8',
              borderRadius: '2px',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#879596',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Checks List */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {checksToDisplay.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#545b64' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No compliance checks matched your filter</div>
            <div style={{ fontSize: '12px', color: '#879596', marginTop: '4px' }}>
              Try adjusting your search query or status filter.
            </div>
          </div>
        ) : (
          checksToDisplay.map((check) => {
            const statusBadge = getStatusBadge(check.status);
            const sevBadge = getSeverityBadge(check.severity);

            return (
              <div
                key={check.id}
                style={{
                  border: '1px solid #eaeded',
                  borderRadius: '2px',
                  padding: '16px',
                  backgroundColor: check.status === 'FAIL' ? '#fffaf9' : '#ffffff',
                  borderLeft: check.status === 'FAIL' ? '4px solid #c5221f' : check.status === 'WARNING' ? '4px solid #b06000' : '4px solid #137333',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Top Row: ID, Badges, Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      padding: '2px 8px',
                      borderRadius: '2px',
                    }}>
                      {statusBadge.label}
                    </span>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: sevBadge.bg,
                      color: sevBadge.color,
                      padding: '2px 6px',
                      borderRadius: '2px',
                    }}>
                      {check.severity}
                    </span>

                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#545b64' }}>
                      {check.id}
                    </span>

                    <span style={{ fontSize: '12px', color: '#879596' }}>•</span>

                    <span style={{ fontSize: '12px', color: '#545b64' }}>
                      {check.pillarIcon} {check.pillarName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(check)}
                    style={{
                      background: 'none',
                      border: '1px solid #d5dbdb',
                      borderRadius: '2px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#545b64',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedId === check.id ? '✓ Copied' : '📋 Copy Details'}
                  </button>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#16191f', margin: '0 0 6px 0' }}>
                  {check.name}
                </h3>

                <p style={{ fontSize: '13px', color: '#545b64', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  {check.description}
                </p>

                {/* Remediation Box */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '2px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700, color: '#16191f', marginRight: '6px' }}>
                    💡 AWS Well-Architected Remediation:
                  </span>
                  <span style={{ color: '#202124' }}>
                    {check.remediation}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
