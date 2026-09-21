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
        width: '460px',
        maxWidth: '100vw',
        backgroundColor: '#ffffff',
        boxShadow: '-6px 0px 0px #0f172a',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '2px solid #0f172a',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      {/* Drawer Window Titlebar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: '#ec7211',
              color: '#ffffff',
              padding: '2px 6px',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              border: '1.5px solid #0f172a',
              letterSpacing: '0.05em',
            }}
          >
            BEDROCK
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#0f172a',
            }}
          >
            [AI_COPILOT_SHELL.BAT]
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: 700,
              marginRight: '6px',
            }}
          >
            [_] [□]
          </span>
          <button
            onClick={onClose}
            aria-label="Close Drawer"
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: 900,
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '1px 1px 0px #0f172a',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '2px solid #0f172a',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => handleSend('Generate Terraform for SEC-001 SSH Port 22 lockdown', 'terraform')}
          style={{
            fontSize: '11px',
            padding: '5px 10px',
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            color: '#0284c7',
            fontFamily: 'var(--font-mono, monospace)',
            boxShadow: '2px 2px 0px #0f172a',
          }}
        >
          🛠️ [TF] FIX_SSH_PORT_22
        </button>

        <button
          onClick={() => handleSend('Generate Terraform for EBS gp3 migration', 'terraform')}
          style={{
            fontSize: '11px',
            padding: '5px 10px',
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            color: '#059669',
            fontFamily: 'var(--font-mono, monospace)',
            boxShadow: '2px 2px 0px #0f172a',
          }}
        >
          🛠️ [TF] GP2_TO_GP3
        </button>
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#f1f5f9',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                backgroundColor: isUser ? '#f8fafc' : '#ffffff',
                color: '#0f172a',
                padding: '12px 14px',
                border: '2px solid #0f172a',
                boxShadow: isUser ? '3px 3px 0px #0f172a' : '3px 3px 0px #0f172a',
                fontSize: '12px',
                lineHeight: '1.6',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '8px',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    color: isUser ? '#0284c7' : '#ec7211',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isUser ? '👤 YOU [OPERATOR]' : '⚡ AWS_BEDROCK [NOVA_LITE]'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: msg.text.includes('```') ? 'var(--font-mono, monospace)' : 'inherit',
                  fontWeight: 500,
                }}
              >
                {msg.text}
              </div>

              {msg.text.includes('```') && (
                <button
                  onClick={() => copyCodeToClipboard(msg.text, msg.id)}
                  className="aws-btn-secondary"
                  style={{
                    marginTop: '10px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    border: '1.5px solid #0f172a',
                    boxShadow: '2px 2px 0px #0f172a',
                    backgroundColor: copiedId === msg.id ? '#ecfdf5' : '#ffffff',
                    color: copiedId === msg.id ? '#059669' : '#0f172a',
                  }}
                >
                  {copiedId === msg.id ? '✓ COPIED_HCL_CODE' : '📋 COPY_TERRAFORM_HCL'}
                </button>
              )}
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#ffffff',
              padding: '10px 14px',
              border: '2px solid #0f172a',
              boxShadow: '3px 3px 0px #0f172a',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#0f172a',
              fontWeight: 700,
            }}
          >
            ⚡ BEDROCK_INFERENCE_IN_PROGRESS :: SYNTHESIZING_IAC...
          </div>
        )}
      </div>

      {/* Mode Switcher & Input Footer */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: '#ffffff',
          borderTop: '2px solid #0f172a',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setMode('chat')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                border: '2px solid #0f172a',
                backgroundColor: mode === 'chat' ? '#0f172a' : '#ffffff',
                color: mode === 'chat' ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                boxShadow: mode === 'chat' ? 'none' : '2px 2px 0px #0f172a',
              }}
            >
              💬 GENERAL_Q&amp;A
            </button>
            <button
              onClick={() => setMode('terraform')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                border: '2px solid #0f172a',
                backgroundColor: mode === 'terraform' ? '#ec7211' : '#ffffff',
                color: mode === 'terraform' ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                boxShadow: mode === 'terraform' ? 'none' : '2px 2px 0px #0f172a',
              }}
            >
              🛠️ TERRAFORM_GEN
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={mode === 'terraform' ? 'PROMPT: Generate Terraform for...' : 'PROMPT: Ask Copilot about infrastructure...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '2px solid #0f172a',
              fontSize: '12px',
              outline: 'none',
              fontFamily: 'var(--font-mono, monospace)',
              backgroundColor: '#f8fafc',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="aws-btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '12px',
            }}
          >
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
}
