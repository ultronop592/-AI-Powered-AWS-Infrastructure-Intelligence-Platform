'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveSession, AWSSession } from '../lib/api';

interface NavbarProps {
  isBackendOnline?: boolean;
  isMockData?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  onToggleCopilot?: () => void;
  onOpenAWSModal?: () => void;
}

export default function Navbar({
  isBackendOnline = true,
  isMockData = false,
  onRefresh,
  isLoading = false,
  onToggleCopilot,
  onOpenAWSModal,
}: NavbarProps) {
  const [activeSession, setActiveSession] = useState<AWSSession | null>(null);

  useEffect(() => {
    setActiveSession(getActiveSession());
  }, []);

  return (
    <header style={{
      backgroundColor: '#16191f',
      color: '#ffffff',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '2px solid #ec7211',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}>
          <div style={{
            backgroundColor: '#ec7211',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '14px',
            padding: '3px 8px',
            borderRadius: '2px',
            letterSpacing: '0.5px'
          }}>
            AWS
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.2px' }}>
            CloudOps AI
          </span>
          <span style={{
            fontSize: '11px',
            backgroundColor: '#232f3e',
            color: '#d5dbdb',
            padding: '2px 6px',
            borderRadius: '2px',
            border: '1px solid #3c4d61'
          }}>
            Console v2.0
          </span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: '0 1 340px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search AWS resources, EC2, S3, Security..."
            style={{
              width: '100%',
              backgroundColor: '#232f3e',
              border: '1px solid #3c4d61',
              borderRadius: '2px',
              padding: '6px 12px 6px 32px',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#879596"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '10px', top: '9px' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {/* Actions & Status Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Connect AWS Account Button */}
        {onOpenAWSModal ? (
          <button
            onClick={onOpenAWSModal}
            className="aws-btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: activeSession ? '#137333' : '#232f3e',
              color: '#ffffff',
              borderColor: activeSession ? '#137333' : '#3c4d61',
            }}
          >
            🔑 {activeSession ? `AWS: ${activeSession.account_id || 'Connected'}` : 'Connect AWS Keys'}
          </button>
        ) : (
          <Link
            href="/settings"
            className="aws-btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: activeSession ? '#137333' : '#232f3e',
              color: '#ffffff',
              borderColor: activeSession ? '#137333' : '#3c4d61',
              textDecoration: 'none',
            }}
          >
            🔑 {activeSession ? `AWS: ${activeSession.account_id || 'Connected'}` : 'Connect AWS Keys'}
          </Link>
        )}

        {/* Copilot Drawer Toggle Button */}
        {onToggleCopilot ? (
          <button
            onClick={onToggleCopilot}
            className="aws-btn-primary"
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: '#ec7211',
              borderColor: '#ec7211'
            }}
          >
            💬 AI Copilot
          </button>
        ) : (
          <Link
            href="/copilot"
            className="aws-btn-primary"
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: '#ec7211',
              borderColor: '#ec7211',
              textDecoration: 'none'
            }}
          >
            💬 AI Copilot
          </Link>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="aws-btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#232f3e',
              color: '#ffffff',
              borderColor: '#3c4d61'
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {isLoading ? 'Syncing...' : 'Sync AWS'}
          </button>
        )}

        {/* Region */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#d5dbdb',
          backgroundColor: '#232f3e',
          padding: '4px 10px',
          borderRadius: '2px',
          border: '1px solid #3c4d61'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec7211' }}></span>
          <span>{activeSession?.region || 'us-east-1'}</span>
        </div>

        {/* Backend Status Badge */}
        <div style={{
          fontSize: '12px',
          padding: '4px 10px',
          borderRadius: '2px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isBackendOnline ? '#137333' : '#b06000',
          color: '#ffffff'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ffffff'
          }}></span>
          {isBackendOnline ? 'FastAPI Connected' : 'FastAPI Offline (Mock)'}
        </div>
      </div>
    </header>
  );
}
