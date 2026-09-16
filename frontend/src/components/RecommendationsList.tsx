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
        <div className="aws-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b06000" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Infrastructure Recommendations ({recommendations.length})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#545b64' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec7211' }}></span>
              AIOps One-Click Auto-Fix Enabled
            </span>
          </div>
        </div>

        <div className="aws-card-body">
          {recommendations.length === 0 ? (
            <div style={{ padding: '16px', color: '#137333', backgroundColor: '#e6f4ea', borderRadius: '4px', fontSize: '13px' }}>
              ✓ No infrastructure optimization warnings found. Your AWS environment is configured cleanly!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      border: isFixed ? '1px solid #ceead6' : '1px solid #eaeded',
                      borderRadius: '4px',
                      padding: '16px',
                      backgroundColor: isFixed ? '#f6fbf7' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`aws-badge ${badgeClass}`}>
                          {severity} SEVERITY
                        </span>
                        {rec.category && (
                          <span style={{ fontSize: '12px', color: '#545b64', fontWeight: 500 }}>
                            • {rec.category}
                          </span>
                        )}
                        {rec.resource_id && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              backgroundColor: '#f2f3f3',
                              padding: '2px 6px',
                              borderRadius: '2px',
                              color: '#0073bb',
                              fontWeight: 600,
                            }}
                          >
                            {rec.resource_id}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {rec.id && (
                          <span style={{ fontSize: '11px', color: '#879596', fontFamily: 'monospace' }}>
                            {rec.id}
                          </span>
                        )}

                        {/* Action status or Auto-Fix button */}
                        {isFixed ? (
                          <span
                            className="aws-badge aws-badge-success"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Fixed &amp; Verified
                          </span>
                        ) : isAutoFixable ? (
                          <button
                            type="button"
                            onClick={() => setSelectedRec(rec)}
                            className="aws-btn-primary"
                            style={{
                              backgroundColor: '#ec7211',
                              borderColor: '#ec7211',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              borderRadius: '3px',
                            }}
                          >
                            ⚡ Auto-Fix
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#16191f' }}>
                      {rec.title || rec.type || 'Infrastructure Optimization'}
                    </h4>

                    <p style={{ fontSize: '13px', color: '#545b64', lineHeight: '1.5' }}>
                      {rec.description}
                    </p>

                    {rec.action && (
                      <div
                        style={{
                          marginTop: '2px',
                          padding: '10px 12px',
                          backgroundColor: '#fafafa',
                          borderLeft: '3px solid #ec7211',
                          fontSize: '12px',
                          color: '#16191f',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#ec7211', fontWeight: 700 }}>Recommended Action: </span>
                          {rec.action}
                        </div>

                        {isAutoFixable && !isFixed && (
                          <button
                            type="button"
                            onClick={() => setSelectedRec(rec)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ec7211',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Apply automated Boto3 fix &rarr;
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

