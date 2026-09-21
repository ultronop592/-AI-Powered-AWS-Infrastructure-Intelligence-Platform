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
      backgroundColor: '#ffffff',
      color: '#0f172a',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '2px solid #0f172a',
      boxShadow: '0 2px 0px rgba(15, 23, 42, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#0f172a' }}>
          <div style={{
            backgroundColor: '#ec7211',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '13px',
            padding: '3px 8px',
            border: '2px solid #0f172a',
            boxShadow: '2px 2px 0px #0f172a',
            letterSpacing: '0.5px',
            fontFamily: 'var(--font-mono)'
          }}>
            [AWS]
          </div>
          <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
            CloudOps AI
          </span>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            padding: '2px 6px',
            border: '1px solid #0f172a',
            fontWeight: 700
          }}>
            v2.0.EXE
          </span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: '0 1 360px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="FIND RESOURCE [EC2, S3, RDS]..."
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '2px 2px 0px #0f172a',
              padding: '6px 12px 6px 32px',
              color: '#0f172a',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Connect AWS Account Button */}
        {onOpenAWSModal ? (
          <button
            onClick={onOpenAWSModal}
            className="aws-btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              backgroundColor: activeSession ? '#ecfdf5' : '#ffffff',
              color: activeSession ? '#059669' : '#0f172a',
            }}
          >
            🔑 {activeSession ? `AWS: ${activeSession.account_id || 'Connected'}` : 'Connect AWS'}
          </button>
        ) : (
          <Link
            href="/settings"
            className="aws-btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              backgroundColor: activeSession ? '#ecfdf5' : '#ffffff',
              color: activeSession ? '#059669' : '#0f172a',
              textDecoration: 'none',
            }}
          >
            🔑 {activeSession ? `AWS: ${activeSession.account_id || 'Connected'}` : 'Connect AWS'}
          </Link>
        )}

        {/* Copilot Drawer Toggle Button */}
        {onToggleCopilot ? (
          <button
            onClick={onToggleCopilot}
            className="aws-btn-primary"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
            }}
          >
            💬 Copilot.sh
          </button>
        ) : (
          <Link
            href="/copilot"
            className="aws-btn-primary"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              textDecoration: 'none'
            }}
          >
            💬 Copilot.sh
          </Link>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="aws-btn-secondary"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
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
            {isLoading ? 'SYNC...' : 'SYNC'}
          </button>
        )}

        {/* Region */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: '#0f172a',
          backgroundColor: '#f8fafc',
          padding: '4px 8px',
          border: '1px solid #0f172a',
          boxShadow: '1px 1px 0px #0f172a',
        }}>
          <span style={{ width: '7px', height: '7px', backgroundColor: '#ec7211', display: 'inline-block' }}></span>
          <span>{activeSession?.region || 'us-east-1'}</span>
        </div>

        {/* Backend Status Badge */}
        <div style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          padding: '4px 8px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid #0f172a',
          boxShadow: '1px 1px 0px #0f172a',
          backgroundColor: isBackendOnline ? '#ecfdf5' : '#fffbeb',
          color: isBackendOnline ? '#059669' : '#d97706',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: isBackendOnline ? '#059669' : '#d97706',
            display: 'inline-block'
          }}></span>
          {isBackendOnline ? 'API: ONLINE' : 'API: MOCK'}
        </div>
      </div>
    </header>
  );
}
