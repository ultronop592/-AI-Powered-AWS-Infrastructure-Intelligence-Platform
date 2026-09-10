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
        return { color: '#137333', icon: '🪣', label: 'Amazon S3' };
      case 'rds':
        return { color: '#0073bb', icon: '🗄️', label: 'Amazon RDS' };
      case 'lambda':
        return { color: '#d13212', icon: 'λ', label: 'AWS Lambda' };
      case 'ebs':
        return { color: '#b06000', icon: '💾', label: 'Amazon EBS' };
      case 'security_group':
        return { color: '#8c44ad', icon: '🛡️', label: 'Security Group' };
      case 'vpc':
        return { color: '#545b64', icon: '🌐', label: 'Amazon VPC' };
      case 'ecs':
        return { color: '#ec7211', icon: '📦', label: 'Amazon ECS' };
      default:
        return { color: '#545b64', icon: '⚙️', label: service || 'AWS Resource' };
    }
  };

  const config = getServiceConfig(type);

  // Status color
  const getStatusStyle = (st: string, risk: string) => {
    if (risk === 'CRITICAL' || st === 'critical') {
      return { bg: '#fce8e6', color: '#c5221f', text: 'CRITICAL' };
    }
    if (risk === 'HIGH' || st === 'stopped' || st === 'warning') {
      return { bg: '#fef7e0', color: '#b06000', text: st.toUpperCase() };
    }
    return { bg: '#e6f4ea', color: '#137333', text: (st || 'ACTIVE').toUpperCase() };
  };

  const statusStyle = getStatusStyle(status, risk_level);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: selected ? '2px solid #ec7211' : (risk_level === 'CRITICAL' ? '2px solid #c5221f' : '1px solid #d5dbdb'),
        borderRadius: '3px',
        minWidth: '220px',
        maxWidth: '260px',
        boxShadow: selected ? '0 0 0 3px rgba(236,114,17,0.2)' : '0 1px 3px 0 rgba(0,28,36,0.1)',
        overflow: 'hidden',
        fontSize: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Incoming Connection Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: config.color,
          width: '8px',
          height: '8px',
          border: '2px solid #ffffff',
        }}
      />

      {/* Node Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #eaeded',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>{config.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: config.color }}>
            {config.label}
          </span>
        </div>

        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: '2px',
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            letterSpacing: '0.3px',
          }}
        >
          {statusStyle.text}
        </span>
      </div>

      {/* Node Body */}
      <div style={{ padding: '8px 10px' }}>
        <div
          style={{
            fontWeight: 600,
            color: '#16191f',
            fontSize: '12px',
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
              marginTop: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: risk_level === 'CRITICAL' ? '#fce8e6' : '#fef7e0',
              color: risk_level === 'CRITICAL' ? '#c5221f' : '#b06000',
              padding: '2px 6px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            <span>⚠️</span>
            <span>{findings_count} {findings_count === 1 ? 'finding' : 'findings'}</span>
          </div>
        )}
      </div>

      {/* Outgoing Connection Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: config.color,
          width: '8px',
          height: '8px',
          border: '2px solid #ffffff',
        }}
      />
    </div>
  );
}
