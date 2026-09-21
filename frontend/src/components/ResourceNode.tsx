'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface ResourceNodeProps {
  data: {
    id: string;
    type: string;
    label: string;
    name: string;
    service: string;
    status: string;
    risk_level: string;
    findings_count: number;
    details: Record<string, any>;
  };
  selected?: boolean;
}

export default function ResourceNode({ data, selected }: ResourceNodeProps) {
  const { service, label, status, risk_level, findings_count, type } = data;

  // AWS Service icon and color scheme
  const getServiceConfig = (srvType: string) => {
    switch (srvType) {
      case 'ec2':
        return { color: '#ec7211', icon: '🖥️', label: 'Amazon EC2' };
      case 's3':
        return { color: '#059669', icon: '🪣', label: 'Amazon S3' };
      case 'rds':
        return { color: '#0284c7', icon: '🗄️', label: 'Amazon RDS' };
      case 'lambda':
        return { color: '#dc2626', icon: 'λ', label: 'AWS Lambda' };
      case 'ebs':
        return { color: '#d97706', icon: '💾', label: 'Amazon EBS' };
      case 'security_group':
        return { color: '#0f172a', icon: '🛡️', label: 'Security Group' };
      case 'vpc':
        return { color: '#475569', icon: '🌐', label: 'Amazon VPC' };
      case 'ecs':
        return { color: '#ec7211', icon: '📦', label: 'Amazon ECS' };
      default:
        return { color: '#475569', icon: '⚙️', label: service || 'AWS Resource' };
    }
  };

  const config = getServiceConfig(type);

  // Status color
  const getStatusStyle = (st: string, risk: string) => {
    if (risk === 'CRITICAL' || st === 'critical') {
      return { bg: '#fef2f2', color: '#dc2626', text: 'CRITICAL' };
    }
    if (risk === 'HIGH' || st === 'stopped' || st === 'warning') {
      return { bg: '#fffbeb', color: '#d97706', text: st.toUpperCase() };
    }
    return { bg: '#ecfdf5', color: '#059669', text: (st || 'ACTIVE').toUpperCase() };
  };

  const statusStyle = getStatusStyle(status, risk_level);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: selected ? '2px solid #ec7211' : (risk_level === 'CRITICAL' ? '2px solid #dc2626' : '2px solid #0f172a'),
        minWidth: '220px',
        maxWidth: '260px',
        boxShadow: selected ? '4px 4px 0px #ec7211' : '3px 3px 0px #0f172a',
        overflow: 'hidden',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Top Service Accent Band */}
      <div style={{ height: '3px', backgroundColor: config.color, width: '100%', borderBottom: '1px solid #0f172a' }} />

      {/* Incoming Connection Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: config.color,
          width: '9px',
          height: '9px',
          border: '1.5px solid #0f172a',
        }}
      />

      {/* Node Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 8px',
          backgroundColor: '#f8fafc',
          borderBottom: '1.5px solid #0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '13px' }}>{config.icon}</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: config.color }}>
            {config.label}
          </span>
        </div>

        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            padding: '1px 5px',
            border: '1px solid #0f172a',
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            letterSpacing: '0.02em',
          }}
        >
          {statusStyle.text}
        </span>
      </div>

      {/* Node Body */}
      <div style={{ padding: '8px 10px' }}>
        <div
          style={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: '11px',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={label}
        >
          {label}
        </div>

        {/* Findings Badge */}
        {findings_count > 0 && (
          <div
            style={{
              marginTop: '5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: risk_level === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
              color: risk_level === 'CRITICAL' ? '#dc2626' : '#d97706',
              border: '1px solid #0f172a',
              padding: '1px 5px',
              fontSize: '9px',
              fontWeight: 700,
            }}
          >
            <span>⚠️</span>
            <span>{findings_count} {findings_count === 1 ? 'FINDING' : 'FINDINGS'}</span>
          </div>
        )}
      </div>

      {/* Outgoing Connection Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: config.color,
          width: '9px',
          height: '9px',
          border: '1.5px solid #0f172a',
        }}
      />
    </div>
  );
}
