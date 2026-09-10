'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ResourceNode from './ResourceNode';
import { GraphNode, GraphEdge, ResourceGraphResponse } from '../lib/api';

const nodeTypes = {
  ec2: ResourceNode,
  s3: ResourceNode,
  rds: ResourceNode,
  lambda: ResourceNode,
  ebs: ResourceNode,
  security_group: ResourceNode,
  vpc: ResourceNode,
  ecs: ResourceNode,
  custom: ResourceNode,
};

interface ResourceGraphProps {
  graphData: ResourceGraphResponse;
}

export default function ResourceGraph({ graphData }: ResourceGraphProps) {
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);

  // Transform backend graph nodes into React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return (graphData.nodes || []).map((n) => ({
      id: n.id,
      type: n.type || 'custom',
      position: n.position || { x: 100, y: 100 },
      data: {
        id: n.id,
        type: n.type,
        label: n.label || n.name || n.id,
        name: n.name || n.id,
        service: n.service || 'AWS Resource',
        status: n.status || 'active',
        risk_level: n.risk_level || 'LOW',
        findings_count: n.findings_count || 0,
        details: n.details || {},
      },
    }));
  }, [graphData.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return (graphData.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated,
      style: e.style || { stroke: '#aab7b8', strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: '#545b64', fontWeight: 600 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.85 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 2,
    }));
  }, [graphData.edges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    let result = nodes;

    if (selectedService !== 'ALL') {
      result = result.filter((n) => (n.data?.type as string) === selectedService.toLowerCase());
    }

    if (showCriticalOnly) {
      result = result.filter(
        (n) => (n.data?.risk_level as string) === 'CRITICAL' || (n.data?.findings_count as number) > 0
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          (n.data?.label as string)?.toLowerCase().includes(q) ||
          (n.data?.id as string)?.toLowerCase().includes(q) ||
          (n.data?.service as string)?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [nodes, selectedService, showCriticalOnly, searchQuery]);

  // Edges that connect only currently visible nodes
  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const found = (graphData.nodes || []).find((n) => n.id === node.id);
      if (found) {
        setActiveNode(found);
      } else {
        setActiveNode({
          id: node.id,
          type: (node.data?.type as string) || 'unknown',
          label: (node.data?.label as string) || node.id,
          name: (node.data?.name as string) || node.id,
          service: (node.data?.service as string) || 'AWS',
          status: (node.data?.status as string) || 'active',
          risk_level: (node.data?.risk_level as string) || 'LOW',
          findings_count: (node.data?.findings_count as number) || 0,
          details: (node.data?.details as Record<string, any>) || {},
          position: node.position,
        });
      }
    },
    [graphData.nodes]
  );

  // MiniMap node color logic
  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'ec2':
        return '#ec7211';
      case 's3':
        return '#137333';
      case 'rds':
        return '#0073bb';
      case 'lambda':
        return '#d13212';
      case 'ebs':
        return '#b06000';
      case 'security_group':
        return '#8c44ad';
      default:
        return '#545b64';
    }
  };

  // Connected edges for active node
  const activeNodeConnections = useMemo(() => {
    if (!activeNode) return [];
    return (graphData.edges || []).filter(
      (e) => e.source === activeNode.id || e.target === activeNode.id
    );
  }, [activeNode, graphData.edges]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 170px)', minHeight: '650px', backgroundColor: '#fafafa', border: '1px solid #eaeded', borderRadius: '2px', overflow: 'hidden' }}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      >
        <Background color="#e0e0e0" gap={16} size={1} />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-right"
          style={{ height: 110, width: 170, backgroundColor: '#ffffff', border: '1px solid #d5dbdb' }}
        />

        {/* Top Filter Bar Panel */}
        <Panel position="top-left" style={{ margin: '12px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '10px 14px',
            borderRadius: '2px',
            border: '1px solid #d5dbdb',
            boxShadow: '0 1px 4px rgba(0,28,36,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {/* Service Filters */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { key: 'ALL', label: 'All Services' },
                { key: 'EC2', label: '🖥️ EC2' },
                { key: 'SECURITY_GROUP', label: '🛡️ SGs' },
                { key: 'EBS', label: '💾 EBS' },
                { key: 'RDS', label: '🗄️ RDS' },
                { key: 'S3', label: '🪣 S3' },
                { key: 'LAMBDA', label: 'λ Lambda' },
                { key: 'VPC', label: '🌐 VPC' },
              ].map((srv) => {
                const isActive = selectedService === srv.key;
                return (
                  <button
                    key={srv.key}
                    onClick={() => setSelectedService(srv.key)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '2px',
                      border: isActive ? '1px solid #ec7211' : '1px solid #d5dbdb',
                      backgroundColor: isActive ? '#fef8f3' : '#ffffff',
                      color: isActive ? '#ec7211' : '#545b64',
                      cursor: 'pointer',
                    }}
                  >
                    {srv.label}
                  </button>
                );
              })}
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#d5dbdb' }} />

            {/* Critical Toggle */}
            <button
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '2px',
                border: showCriticalOnly ? '1px solid #c5221f' : '1px solid #d5dbdb',
                backgroundColor: showCriticalOnly ? '#fce8e6' : '#ffffff',
                color: showCriticalOnly ? '#c5221f' : '#545b64',
                cursor: 'pointer',
              }}
            >
              ⚠️ Risk Findings Only
            </button>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #aab7b8',
                borderRadius: '2px',
                outline: 'none',
                width: '130px',
              }}
            />
          </div>
        </Panel>

        {/* Legend Panel at Top Right */}
        <Panel position="top-right" style={{ margin: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: '8px 12px',
            borderRadius: '2px',
            border: '1px solid #d5dbdb',
            fontSize: '11px',
            color: '#545b64',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontWeight: 700, color: '#16191f' }}>Topology:</span>
            <span>🌐 Network</span>
            <span>&rarr;</span>
            <span>🛡️ Security</span>
            <span>&rarr;</span>
            <span>🖥️ Compute</span>
            <span>&rarr;</span>
            <span>💾 Storage/DB</span>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Inspector Drawer (Right Panel) */}
      {activeNode && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '360px',
          height: '100%',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #eaeded',
          boxShadow: '-2px 0 8px rgba(0,28,36,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          overflowY: 'auto',
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eaeded',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: '#fafafa',
          }}>
            <div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#545b64',
                letterSpacing: '0.5px',
              }}>
                {activeNode.service} Resource Inspector
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#16191f', margin: '4px 0 0 0', wordBreak: 'break-all' }}>
                {activeNode.label || activeNode.name}
              </h3>
            </div>

            <button
              onClick={() => setActiveNode(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                color: '#545b64',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Status & Risk Summary */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '2px',
                backgroundColor: activeNode.status === 'running' || activeNode.status === 'active' ? '#e6f4ea' : '#fef7e0',
                color: activeNode.status === 'running' || activeNode.status === 'active' ? '#137333' : '#b06000',
              }}>
                Status: {(activeNode.status || 'ACTIVE').toUpperCase()}
              </span>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '2px',
                backgroundColor: activeNode.risk_level === 'CRITICAL' ? '#fce8e6' : activeNode.risk_level === 'HIGH' ? '#fef7e0' : '#e6f4ea',
                color: activeNode.risk_level === 'CRITICAL' ? '#c5221f' : activeNode.risk_level === 'HIGH' ? '#b06000' : '#137333',
              }}>
                Risk: {activeNode.risk_level || 'LOW'}
              </span>
            </div>

            {/* Key Properties Table */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '8px' }}>
                Resource Properties
              </div>
              <div style={{ border: '1px solid #eaeded', borderRadius: '2px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eaeded', backgroundColor: '#ffffff' }}>
                      <td style={{ padding: '6px 10px', color: '#545b64', fontWeight: 600, width: '40%' }}>Resource ID</td>
                      <td style={{ padding: '6px 10px', color: '#16191f', fontFamily: 'monospace' }}>{activeNode.id}</td>
                    </tr>
                    {Object.entries(activeNode.details || {}).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #eaeded', backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '6px 10px', color: '#545b64', fontWeight: 600 }}>{key}</td>
                        <td style={{ padding: '6px 10px', color: '#16191f' }}>
                          {Array.isArray(val) ? val.join(', ') : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connected Dependencies */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16191f', marginBottom: '8px' }}>
                Connected Relationships ({activeNodeConnections.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeNodeConnections.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#879596' }}>No direct connections mapped.</div>
                ) : (
                  activeNodeConnections.map((conn) => {
                    const isOutgoing = conn.source === activeNode.id;
                    const otherId = isOutgoing ? conn.target : conn.source;
                    return (
                      <div
                        key={conn.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#fafafa',
                          border: '1px solid #eaeded',
                          borderRadius: '2px',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#ec7211' }}>{isOutgoing ? '→' : '←'}</span>
                          <span style={{ fontWeight: 600, color: '#16191f' }}>{otherId}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#545b64', backgroundColor: '#eaeded', padding: '1px 5px', borderRadius: '2px' }}>
                          {conn.label || 'connected'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Findings Alert if any */}
            {(activeNode.findings_count || 0) > 0 && (
              <div style={{
                backgroundColor: '#fce8e6',
                border: '1px solid #fad2cf',
                borderRadius: '2px',
                padding: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#c5221f', marginBottom: '4px' }}>
                  <span>🚨</span>
                  <span>{activeNode.findings_count} Security / Cost Finding(s)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#545b64', lineHeight: 1.4 }}>
                  This resource has active configuration findings. Ask CloudOps AI Copilot for automated remediation code.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
