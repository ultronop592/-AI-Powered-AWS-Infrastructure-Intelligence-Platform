'use client';

import React from 'react';
import { Recommendation } from '../lib/api';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
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
      </div>

      <div className="aws-card-body">
        {recommendations.length === 0 ? (
          <div style={{ padding: '16px', color: '#137333', backgroundColor: '#e6f4ea', borderRadius: '4px', fontSize: '13px' }}>
            ✓ No infrastructure optimization warnings found. Your AWS environment is configured cleanly!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.map((rec, index) => {
              const severity = (rec.severity || 'MEDIUM').toUpperCase();
              let badgeClass = 'aws-badge-warning';
              if (severity === 'HIGH' || severity === 'CRITICAL') badgeClass = 'aws-badge-danger';
              if (severity === 'LOW') badgeClass = 'aws-badge-info';

              return (
                <div
                  key={rec.id || index}
                  style={{
                    border: '1px solid #eaeded',
                    borderRadius: '4px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`aws-badge ${badgeClass}`}>
                        {severity} SEVERITY
                      </span>
                      {rec.category && (
                        <span style={{ fontSize: '12px', color: '#545b64', fontWeight: 500 }}>
                          • {rec.category}
                        </span>
                      )}
                    </div>
                    {rec.id && (
                      <span style={{ fontSize: '11px', color: '#879596', fontFamily: 'monospace' }}>
                        {rec.id}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#16191f' }}>
                    {rec.title || rec.type || 'Infrastructure Optimization'}
                  </h4>

                  <p style={{ fontSize: '13px', color: '#545b64', lineHeight: '1.5' }}>
                    {rec.description}
                  </p>

                  {rec.action && (
                    <div style={{
                      marginTop: '4px',
                      padding: '10px 12px',
                      backgroundColor: '#fafafa',
                      borderLeft: '3px solid #ec7211',
                      fontSize: '12px',
                      color: '#16191f',
                      fontWeight: 500
                    }}>
                      <span style={{ color: '#ec7211', fontWeight: 700 }}>Recommended Action: </span>
                      {rec.action}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
