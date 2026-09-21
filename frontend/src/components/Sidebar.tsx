'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('cloudops_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // Ignore localStorage read errors in SSR
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cloudops_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const navItems = [
    {
      label: 'Home HQ',
      href: '/',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      badge: 'HQ',
    },
    {
      label: 'Live Dashboard',
      href: '/overview',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      badge: 'OPS',
    },
    {
      label: 'Cost Explorer',
      href: '/cost',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      label: 'EC2 Compute',
      href: '/ec2',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8"></rect>
          <rect x="2" y="14" width="20" height="8"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      ),
    },
    {
      label: 'S3 Storage',
      href: '/s3',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      label: 'Security Guard',
      href: '/security',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      badge: 'SEC',
    },
    {
      label: 'Deep Services',
      href: '/services-analytics',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      ),
      badge: 'RDS/EBS',
    },
    {
      label: 'Well-Architected',
      href: '/compliance',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l7-4 7 4v14"></path>
          <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11H9V10z"></path>
        </svg>
      ),
      badge: 'WAF',
    },
    {
      label: 'Topology Graph',
      href: '/graph',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      badge: 'DAG',
    },
    {
      label: 'CloudWatch Telemetry',
      href: '/metrics',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
      badge: 'CW',
    },
    {
      label: 'AI Copilot Chat',
      href: '/copilot',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      badge: 'AI',
    },
    {
      label: 'Bedrock Intelligence',
      href: '/ai-insights',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M12 12L2.1 12a10 10 0 0 0 9.9 10V12z"></path>
          <path d="M12 12L19.07 4.93a10 10 0 0 0-7.07-2.93V12z"></path>
        </svg>
      ),
      badge: 'NOVA',
    },
    {
      label: 'AWS Credentials',
      href: '/settings',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      badge: 'STS',
    },
  ];

  return (
    <aside style={{
      width: isCollapsed ? '68px' : '240px',
      transition: 'width 0.18s cubic-bezier(0.2, 0, 0, 1)',
      backgroundColor: '#ffffff',
      borderRight: '2px solid #0f172a',
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingBottom: '12px',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      <div>
        {/* Sidebar Header with IN/OUT Toggle Button */}
        <div style={{
          padding: isCollapsed ? '12px 6px 8px 6px' : '12px 14px 8px 14px',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: '#64748b',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '6px'
        }}>
          {!isCollapsed && <span>[SYS_MODULES]</span>}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand Sidebar [OUT]' : 'Collapse Sidebar [IN]'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              padding: isCollapsed ? '4px 6px' : '3px 8px',
              backgroundColor: isCollapsed ? '#ffedd5' : '#ffffff',
              color: isCollapsed ? '#c2410c' : '#0f172a',
              border: '1.5px solid #0f172a',
              boxShadow: '1.5px 1.5px 0px #0f172a',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.1s ease'
            }}
          >
            {isCollapsed ? 'OUT ▶' : '◀ IN'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '0 6px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '8px 4px' : '7px 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isActive ? 800 : 600,
                  color: '#0f172a',
                  backgroundColor: isActive ? '#fff7ed' : 'transparent',
                  border: isActive ? '1.5px solid #0f172a' : '1.5px solid transparent',
                  boxShadow: isActive ? '2px 2px 0px #0f172a' : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.1s ease',
                  marginBottom: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: isActive ? '#ec7211' : '#0f172a', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isActive ? '#ec7211' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#0f172a',
                    padding: '1px 5px',
                    border: '1px solid #0f172a',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Retro Status Card */}
      <div style={{
        margin: isCollapsed ? '8px 4px 0 4px' : '12px 10px 0 10px',
        padding: isCollapsed ? '6px 4px' : '10px 12px',
        border: '2px solid #0f172a',
        boxShadow: '2px 2px 0px #0f172a',
        backgroundColor: '#ffffff',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: '#0f172a',
        textAlign: isCollapsed ? 'center' : 'left'
      }}>
        {isCollapsed ? (
          <div title="Bedrock Model Online: Nova-Lite-1.0 (us-east-1)" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', display: 'inline-block' }} className="anim-pulse"></span>
            <span style={{ fontSize: '8px', fontWeight: 800 }}>OK</span>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#059669', display: 'inline-block' }} className="anim-pulse"></span>
                BEDROCK_ONLINE
              </span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>[OK]</span>
            </div>
            <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#475569' }}>
              MODEL: Nova-Lite-1.0<br />
              REGION: us-east-1
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
