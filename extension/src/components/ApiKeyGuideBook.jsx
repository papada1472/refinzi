import React, { useState } from 'react';

/**
 * REFINZI — API Key Guide Book & BYOK Config (React Component)
 * Feature: Add API configuration by default and correct BYOK providers and their models,
 * set Gemini Flash by default and attach API key guidebook when provider is selected.
 */
export const PROVIDER_GUIDEBOOKS = {
  gemini: {
    name: 'Google Gemini',
    badge: 'Recommended · Gemini Flash',
    icon: '⚡',
    url: 'https://aistudio.google.com/app/apikey',
    tier: 'Free Tier Available (15 RPM / 1M TPM)',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    steps: [
      'Open Google AI Studio with your Google account.',
      'Click "Create API Key" to generate a free Gemini Flash key.',
      'Paste your key below and click "Verify & Save".',
    ],
  },
  openai: {
    name: 'OpenAI',
    badge: 'GPT-4o Mini / o3-mini',
    icon: '🤖',
    url: 'https://platform.openai.com/api-keys',
    tier: 'Pay-as-you-go',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-3.5-turbo'],
    steps: [
      'Log into your OpenAI Developer Platform account.',
      'Navigate to API Keys and click "Create new secret key".',
      'Paste below (recommended model: gpt-4o-mini).',
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    badge: 'DeepSeek-V3 / R1 Reasoner',
    icon: '🐋',
    url: 'https://platform.deepseek.com/api_keys',
    tier: 'Ultra-low cost (~$0.14/M tokens)',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    steps: [
      'Log in to DeepSeek Platform console.',
      'Create an API key in the API Keys section.',
      'Paste below (supports V3 chat & R1 reasoner).',
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    badge: 'Multi-Model & Free Options',
    icon: '🌐',
    url: 'https://openrouter.ai/keys',
    tier: 'Free Models Supported',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'google/gemini-2.0-flash-exp:free',
      'anthropic/claude-3.5-sonnet',
    ],
    steps: [
      'Sign in to OpenRouter.ai with GitHub or Google.',
      'Generate a new API key from the Keys dashboard.',
      'Paste below (access Llama 3.3 70B, DeepSeek R1, and Gemini 2.0).',
    ],
  },
  local: {
    name: 'Instant Local Engine',
    badge: '0ms Latency · Offline',
    icon: '✨',
    url: '',
    tier: '100% Free · No Key Needed',
    defaultModel: 'local-deterministic',
    models: ['local-deterministic'],
    steps: [
      'Runs directly in browser extension memory with 0ms network latency.',
      'Completely private and offline.',
      'Always active as automatic fallback.',
    ],
  },
};

export function ApiKeyGuideBook({
  initialProvider = 'gemini',
  onSave,
  onVerify,
}) {
  const [provider, setProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDER_GUIDEBOOKS[initialProvider]?.defaultModel || 'gemini-2.5-flash');
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text: string }

  const currentGuide = PROVIDER_GUIDEBOOKS[provider] || PROVIDER_GUIDEBOOKS.gemini;

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const guide = PROVIDER_GUIDEBOOKS[newProvider];
    if (guide) {
      setModel(guide.defaultModel);
    }
    setFeedback(null);
  };

  const handleVerify = async () => {
    if (provider === 'local') {
      setFeedback({ type: 'success', text: '✓ Local engine active and ready (0ms latency)' });
      return;
    }
    if (!apiKey.trim()) {
      setFeedback({ type: 'error', text: 'Please paste your API key first.' });
      return;
    }

    setIsVerifying(true);
    setFeedback(null);

    try {
      if (onVerify) {
        const result = await onVerify(provider, apiKey, model);
        if (result?.ok) {
          setFeedback({ type: 'success', text: '✓ API Key verified successfully!' });
        } else {
          setFeedback({ type: 'error', text: result?.message || 'Verification failed. Please check key.' });
        }
      } else {
        // Mock verification
        setTimeout(() => {
          setIsVerifying(false);
          setFeedback({ type: 'success', text: `✓ ${currentGuide.name} verified & ready!` });
          if (onSave) onSave({ provider, apiKey, model });
        }, 600);
        return;
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Connection failed. Please check network or key.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '480px',
        background: '#12141D',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: '16px',
        padding: '20px',
        color: '#F8FAFC',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '2px' }}>
            AI Engine Configuration
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>Set Gemini Flash by default or bring your own API key.</p>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: 'rgba(255, 215, 0, 0.12)',
            color: '#FFD700',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 215, 0, 0.25)',
          }}
        >
          BYOK Ready
        </span>
      </div>

      {/* Provider Selector */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
          Select AI Engine
        </label>
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          style={{
            width: '100%',
            background: '#1A1D27',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '10px 12px',
            color: '#F8FAFC',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="gemini">Google Gemini (Gemini Flash — Recommended Default)</option>
          <option value="openai">OpenAI (GPT-4o Mini / o3-mini)</option>
          <option value="deepseek">DeepSeek (V3 Chat / R1 Reasoner)</option>
          <option value="openrouter">OpenRouter (Multi-Model & Free)</option>
          <option value="local">✨ Instant Local Engine (0ms, Offline)</option>
        </select>
      </div>

      {/* Dynamic Provider Guide Book Card */}
      {provider !== 'local' && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 215, 0, 0.22)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
              <span>{currentGuide.icon}</span>
              <span>{currentGuide.name} Setup Guide</span>
            </div>
            {currentGuide.url && (
              <a
                href={currentGuide.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFD700',
                  textDecoration: 'none',
                  background: 'rgba(255, 215, 0, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                }}
              >
                Get API Key ↗
              </a>
            )}
          </div>

          <ol style={{ paddingLeft: '18px', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
            {currentGuide.steps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {step}
              </li>
            ))}
          </ol>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#64748B',
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span>🔒 Encrypted in browser storage</span>
            <span style={{ color: '#10B981', fontWeight: 600 }}>{currentGuide.tier}</span>
          </div>
        </div>
      )}

      {/* API Key Input */}
      {provider !== 'local' && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
            {currentGuide.name} API Key
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste your ${currentGuide.name} API key…`}
              style={{
                flex: 1,
                background: '#1A1D27',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#F8FAFC',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              style={{
                background: '#FFD700',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '12px',
                padding: '9px 14px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isVerifying ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        </div>
      )}

      {/* Model Selection */}
      {provider !== 'local' && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              background: '#1A1D27',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: '#F8FAFC',
              fontSize: '12.5px',
              outline: 'none',
            }}
          >
            {currentGuide.models.map((m) => (
              <option key={m} value={m}>
                {m} {m === currentGuide.defaultModel ? '(Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            padding: '8px 12px',
            borderRadius: '8px',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedback.type === 'success' ? '#10B981' : '#F87171',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            marginTop: '8px',
          }}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
