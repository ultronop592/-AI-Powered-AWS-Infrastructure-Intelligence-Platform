'use client';

import React, { useState } from 'react';
import { sendCopilotMessage, ChatMessage } from '../lib/api';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AICopilotDrawer({ isOpen, onClose }: AICopilotDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am your **AWS CloudOps AI Copilot** powered by Amazon Bedrock (Nova Lite).

I have direct access to your infrastructure telemetry:
• **Monthly Cost**: $14.67 USD
• **Security Posture**: 75/100 (SSH Port 22 exposed to 0.0.0.0/0)
• **Potential Savings**: $12.40/mo (EBS gp3 + idle EC2 cleanup)

Click a quick action prompt below or ask me any question!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'terraform'>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customMsg?: string, customMode?: 'chat' | 'terraform') => {
    const textToSend = customMsg || input;
    const modeToSend = customMode || mode;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      mode: modeToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInput('');
    setLoading(true);

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
      setLoading(false);
    }
  };

  const copyCodeToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '440px',
        backgroundColor: '#ffffff',
        boxShadow: '-2px 0 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '2px solid #ec7211',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: '#16191f',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '2px',
              fontWeight: 800,
              fontSize: '11px',
            }}
          >
            BEDROCK
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>AWS CloudOps AI Copilot</span>
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #eaeded', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        <button
          onClick={() => handleSend('Generate Terraform for SEC-001 SSH Port 22 lockdown', 'terraform')}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            backgroundColor: '#ffffff',
            border: '1px solid #d5dbdb',
            borderRadius: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 600,
            color: '#0073bb',
          }}
        >
          🛠️ Terraform: Fix SSH Port 22
        </button>

        <button
          onClick={() => handleSend('Generate Terraform for EBS gp3 migration', 'terraform')}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            backgroundColor: '#ffffff',
            border: '1px solid #d5dbdb',
            borderRadius: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 600,
            color: '#137333',
          }}
        >
          🛠️ Terraform: gp2 → gp3
        </button>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8f9fa' }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                backgroundColor: isUser ? '#232f3e' : '#ffffff',
                color: isUser ? '#ffffff' : '#16191f',
                padding: '12px 14px',
                borderRadius: '6px',
                border: isUser ? '1px solid #232f3e' : '1px solid #eaeded',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              <div style={{ fontSize: '10px', color: isUser ? '#d5dbdb' : '#879596', marginBottom: '4px', fontWeight: 600 }}>
                {isUser ? 'You' : 'AWS Bedrock Copilot'} • {msg.timestamp}
              </div>

              <div style={{ whiteSpace: 'pre-wrap', fontFamily: msg.text.includes('```') ? 'monospace' : 'inherit' }}>
                {msg.text}
              </div>

              {msg.text.includes('```') && (
                <button
                  onClick={() => copyCodeToClipboard(msg.text, msg.id)}
                  className="aws-btn-secondary"
                  style={{ marginTop: '8px', padding: '2px 8px', fontSize: '11px' }}
                >
                  {copiedId === msg.id ? '✓ Copied HCL Code!' : '📋 Copy Terraform Code'}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #eaeded', fontSize: '13px', color: '#545b64' }}>
            ⚡ Bedrock Copilot is thinking & generating IaC code...
          </div>
        )}
      </div>

      {/* Mode Switcher & Input Footer */}
      <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderTop: '1px solid #eaeded' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setMode('chat')}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                border: '1px solid #d5dbdb',
                backgroundColor: mode === 'chat' ? '#16191f' : '#ffffff',
                color: mode === 'chat' ? '#ffffff' : '#16191f',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              💬 General Q&amp;A
            </button>
            <button
              onClick={() => setMode('terraform')}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                border: '1px solid #d5dbdb',
                backgroundColor: mode === 'terraform' ? '#ec7211' : '#ffffff',
                color: mode === 'terraform' ? '#ffffff' : '#16191f',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛠️ Terraform Generator
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={mode === 'terraform' ? 'Ask to generate Terraform code...' : 'Ask Copilot about your AWS infrastructure...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d5dbdb',
              borderRadius: '2px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button onClick={() => handleSend()} disabled={loading} className="aws-btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
