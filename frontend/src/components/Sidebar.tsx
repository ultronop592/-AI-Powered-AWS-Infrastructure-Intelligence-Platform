'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      label: 'Cost Explorer',
      href: '/cost',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      label: 'EC2 Compute',
      href: '/ec2',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      ),
    },
    {
      label: 'S3 Storage',
      href: '/s3',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      label: 'Security Guardrails',
      href: '/security',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      badge: 'Sec',
    },
    {
      label: 'Deep Services',
      href: '/services-analytics',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      ),
      badge: 'Deep',
    },
    {
      label: 'Well-Architected',
      href: '/compliance',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l7-4 7 4v14"></path>
          <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11H9V10z"></path>
        </svg>
      ),
      badge: 'WAF',
    },
    {
      label: 'Dependency Graph',
      href: '/graph',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="18" cy="6" r="3"></circle>
          <circle cx="18" cy="18" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <line x1="9" y1="6" x2="15" y2="6"></line>
          <line x1="6" y1="9" x2="6" y2="15"></line>
          <line x1="9" y1="18" x2="15" y2="18"></line>
          <line x1="18" y1="9" x2="18" y2="15"></line>
        </svg>
      ),
      badge: 'Graph',
    },
    {
      label: 'CloudWatch Metrics',
      href: '/metrics',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
      badge: 'CW',
    },
    {
      label: 'AI Copilot Chat',
      href: '/copilot',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      badge: 'Copilot',
    },
    {
      label: 'AI Bedrock Insights',
      href: '/ai-insights',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M12 12L2.1 12a10 10 0 0 0 9.9 10V12z"></path>
          <path d="M12 12L19.07 4.93a10 10 0 0 0-7.07-2.93V12z"></path>
        </svg>
      ),
      badge: 'AI Nova',
    },
    {
      label: 'AWS Settings',
      href: '/settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      badge: 'Keys',
    },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{
          padding: '18px 20px 10px 20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          CloudOps Services
        </div>

        <nav style={{ padding: '0 8px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ec7211' : '#475569',
                  backgroundColor: isActive ? '#fff7ed' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#ec7211' : '#64748b' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: isActive ? '#ec7211' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    letterSpacing: '0.02em'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div style={{
        margin: '12px',
        padding: '14px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
          AWS Bedrock Connected
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#64748b' }}>
          Engine: Amazon Nova Lite<br />
          Region: us-east-1
        </div>
      </div>
    </aside>
  );
}
