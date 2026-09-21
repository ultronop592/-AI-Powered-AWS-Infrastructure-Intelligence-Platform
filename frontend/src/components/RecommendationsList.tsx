'use client';

import React, { useState } from 'react';
import { Recommendation, RemediationResult as RemediationResultType } from '../lib/api';
import RemediationModal from './RemediationModal';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onRefresh?: () => void;
}

const SUPPORTED_FINDING_IDS = new Set(['SEC-001', 'EBS-001', 'S3-001', 'S3-002']);

export default function RecommendationsList({ recommendations, onRefresh }: RecommendationsListProps) {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [remediatedIds, setRemediatedIds] = useState<Set<string>>(new Set());

  const handleRemediated = (result: RemediationResultType) => {
    setRemediatedIds((prev) => new Set(prev).add(result.finding_id));
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <div className="aws-card">
        {/* Retro OS Window Titlebar */}
        <div className="aws-card-header" style={{ backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              AUDIT.LOG
            </span>
            <span>Infrastructure Findings &amp; Auto-Fix ({recommendations.length})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>
              ● AIOPS READY
            </span>
            <div className="retro-controls">
              <span>_</span>
              <span>□</span>
              <span>✕</span>
            </div>
          </div>
        </div>

        <div className="aws-card-body" style={{ padding: '16px' }}>
          {recommendations.length === 0 ? (
            <div style={{
              padding: '16px',
              color: '#059669',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #059669',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700
            }}>
              ✓ NO CRITICAL FINDINGS RECORDED. AWS POSTURE CONFIGURED COMPLIANTLY.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendations.map((rec, index) => {
                const recId = rec.id || `REC-${index}`;
                const severity = (rec.severity || 'MEDIUM').toUpperCase();
                let badgeClass = 'aws-badge-warning';
                if (severity === 'HIGH' || severity === 'CRITICAL') badgeClass = 'aws-badge-danger';
                if (severity === 'LOW') badgeClass = 'aws-badge-info';

                const isAutoFixable = rec.remediation_available || (rec.id && SUPPORTED_FINDING_IDS.has(rec.id.toUpperCase()));
                const isFixed = rec.id ? remediatedIds.has(rec.id.toUpperCase()) : false;

                return (
                  <div
                    key={rec.id || index}
                    style={{
                      border: isFixed ? '2px solid #059669' : '2px solid #0f172a',
                      boxShadow: isFixed ? '3px 3px 0px #059669' : '3px 3px 0px #0f172a',
                      padding: '14px 16px',
                      backgroundColor: isFixed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={`aws-badge ${badgeClass}`}>
                          {severity}
                        </span>
                        {rec.category && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#475569',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #0f172a',
                              padding: '1px 6px',
                            }}
                          >
                            {rec.category.toUpperCase()}
                          </span>
                        )}
                        {rec.resource_id && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #0f172a',
                              padding: '1px 6px',
                              color: '#0284c7',
                              fontWeight: 700,
                            }}
                          >
                            {rec.resource_id}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rec.id && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            [{rec.id}]
                          </span>
                        )}

                        {/* Action status or Auto-Fix button */}
                        {isFixed ? (
                          <span
                            className="aws-badge aws-badge-success"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            ✓ FIXED &amp; VERIFIED
                          </span>
                        ) : isAutoFixable ? (
                          <button
                            type="button"
                            onClick={() => setSelectedRec(rec)}
                            className="aws-btn-primary"
                            style={{
                              padding: '3px 10px',
                              fontSize: '11px',
                            }}
                          >
                            ⚡ AUTO-FIX
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                        {rec.title || rec.type || 'Infrastructure Optimization'}
                      </h4>

                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: 0 }}>
                        {rec.description}
                      </p>
                    </div>

                    {rec.action && (
                      <div
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#fff7ed',
                          border: '1.5px solid #0f172a',
                          boxShadow: '1.5px 1.5px 0px #0f172a',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#9a3412', fontWeight: 700 }}>REMEDIATION: </strong>
                          <span style={{ color: '#334155' }}>{rec.action}</span>
                        </div>

                        {isAutoFixable && !isFixed && (
                          <button
                            type="button"
                            onClick={() => setSelectedRec(rec)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #0f172a',
                              boxShadow: '1px 1px 0px #0f172a',
                              color: '#ea580c',
                              fontWeight: 700,
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            BOTO3 FIX &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auto-Remediation Confirmation Modal */}
      <RemediationModal
        isOpen={!!selectedRec}
        recommendation={selectedRec}
        onClose={() => setSelectedRec(null)}
        onRemediated={handleRemediated}
      />
    </>
  );
}
