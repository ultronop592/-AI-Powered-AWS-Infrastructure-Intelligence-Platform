'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { sendCopilotMessage, checkBackendHealth, fetchDashboardData, ChatMessage, DashboardResponse, MOCK_DASHBOARD } from '../../lib/api';

export default function CopilotPage() {
  const [data, setData] = useState<DashboardResponse>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Welcome to the **AWS CloudOps AI Copilot Workspace**!

I have loaded your live AWS telemetry:
• **Monthly Spend**: $14.67 USD
• **Security Posture Score**: 75/100 (2 exposed security groups)
• **Potential Savings**: $12.40/month (EBS gp3 migration + idle EC2 cleanup)

**What would you like me to do?**
1. Ask questions about your EC2, S3, RDS, or Lambda setup.
2. Click **"Generate Terraform"** to generate production HCL code for any recommendation!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'terraform'>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const health = await checkBackendHealth();
    setIsBackendOnline(health.is_online);
    const res = await fetchDashboardData();
    setData(res);
    // Update welcome message with live account context
    setMessages(prev => [{
      ...prev[0],
      text: (res.is_demo ?? true)
        ? prev[0].text
        : `Welcome to the **AWS CloudOps AI Copilot Workspace**!

I have loaded your live AWS telemetry:
- **Monthly Spend**: $${(res.summary?.monthly_cost || 0).toFixed(2)} USD
- **EC2 Instances**: ${res.summary?.ec2_count || 0}
- **S3 Buckets**: ${res.summary?.s3_bucket_count || 0}
- **Region**: ${res.region || 'us-east-1'}

**What would you like me to do?**
1. Ask questions about your EC2, S3, RDS, or Lambda setup.
2. Click **"Generate Terraform"** to generate production HCL code for any recommendation!`,
    }, ...prev.slice(1)]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDemo = data.is_demo ?? data.is_mock ?? true;

  const handleSend = async (customMsg?: string, customMode?: 'chat' | 'terraform') => {
    const textToSend = customMsg || input;
    const modeToSend = customMode || mode;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      mode: modeToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInput('');
    setChatLoading(true);

    try {
      const replyText = await sendCopilotMessage(textToSend, modeToSend);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        mode: modeToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Error handling
    } finally {
      setChatLoading(false);
    }
  };

  const copyCodeToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isBackendOnline={isBackendOnline} isMockData={isDemo} onRefresh={loadData} isLoading={loading} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px 32px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                AWS CloudOps AI Copilot &amp; Terraform Generator
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                Conversational AI DevOps assistant powered by Amazon Bedrock with context-aware Infrastructure as Code (IaC) generation.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMode('chat')}
                className={mode === 'chat' ? 'aws-btn-primary' : 'aws-btn-secondary'}
                style={{ fontSize: '12px' }}
              >
                💬 General Assistant Mode
              </button>
              <button
                onClick={() => setMode('terraform')}
                className={mode === 'terraform' ? 'aws-btn-primary' : 'aws-btn-secondary'}
                style={{ fontSize: '12px', backgroundColor: mode === 'terraform' ? '#ec7211' : '#ffffff' }}
              >
                🛠️ Terraform Generator Mode
              </button>
            </div>
          </div>

          {/* Main Chat Console Window */}
          <div className="aws-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
            {/* Quick Prompts Header */}
            <div style={{ padding: '12px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #eaeded', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>
                Quick Prompts:
              </span>
              <button
                onClick={() => handleSend('Generate Terraform code for SEC-001 SSH Port 22 lockdown', 'terraform')}
                className="aws-btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                🛠️ Fix Open SSH Port (SEC-001)
              </button>
              <button
                onClick={() => handleSend('Generate Terraform code for EBS gp2 to gp3 migration', 'terraform')}
                className="aws-btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                🛠️ Migrate EBS gp2 → gp3 (EBS-001)
              </button>
              <button
                onClick={() => handleSend('Explain total cost optimization savings plan', 'chat')}
                className="aws-btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                💰 Cost Reduction Strategy
              </button>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff' }}>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      backgroundColor: isUser ? '#232f3e' : '#f8f9fa',
                      color: isUser ? '#ffffff' : '#16191f',
                      padding: '16px 20px',
                      borderRadius: '6px',
                      border: isUser ? '1px solid #232f3e' : '1px solid #eaeded',
                      fontSize: '14px',
                      lineHeight: '1.6',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: isUser ? '#d5dbdb' : '#545b64', marginBottom: '6px', fontWeight: 600 }}>
                      {isUser ? 'You (DevOps Engineer)' : 'AWS Bedrock AI Copilot'} • {msg.timestamp}
                    </div>

                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>

                    {msg.text.includes('```') && (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          onClick={() => copyCodeToClipboard(msg.text, msg.id)}
                          className="aws-btn-primary"
                          style={{ backgroundColor: '#137333', borderColor: '#137333', fontSize: '12px', padding: '4px 12px' }}
                        >
                          {copiedId === msg.id ? '✓ Copied HCL Code!' : '📋 Copy Terraform Code Snippet'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#f8f9fa', padding: '14px 20px', borderRadius: '6px', border: '1px solid #eaeded', fontSize: '14px', color: '#545b64' }}>
                  ⚡ Bedrock AI Copilot is analyzing infrastructure telemetry & generating IaC...
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div style={{ padding: '16px 20px', backgroundColor: '#fafafa', borderTop: '1px solid #eaeded', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder={mode === 'terraform' ? 'Ask Copilot to generate Terraform (HCL) code...' : 'Ask Copilot questions about your AWS infrastructure...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #d5dbdb',
                  borderRadius: '2px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button onClick={() => handleSend()} disabled={chatLoading} className="aws-btn-primary" style={{ padding: '10px 24px' }}>
                {mode === 'terraform' ? 'Generate HCL' : 'Send Message'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
