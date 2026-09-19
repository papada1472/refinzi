import React, { useState, useEffect, useRef } from 'react';

/**
 * REFINZI — Validation Checklist Toast (React Component)
 * Feature 3: Make the value tangible by showing exactly what changed, without breaking the auto-replace flow.
 */
export function ValidationToast({
  mode = 'better', // 'better' | 'expert'
  domain = 'marketing',
  checklist,
  onUndo,
  onCopy,
  onClose,
  durationMs = 6000,
}) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultChecklist =
    mode === 'expert'
      ? [
          'Exact core intent preserved',
          'Scope boundaries locked to task',
          'Execution criteria & constraints added',
          'Defensible assumptions explicitly marked',
        ]
      : [
          'Core intent clarified',
          'Vagueness & ambiguity eliminated',
          'Executable prompt structure calibrated',
        ];

  const items = checklist || defaultChecklist;
  const isExpert = mode === 'expert';

  // Countdown timer that pauses when hovered
  useEffect(() => {
    if (isHovered) return;

    const interval = 50;
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= interval) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, onClose]);

  const handleCopy = () => {
    if (onCopy) onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const progressPercent = Math.max(0, (remainingMs / durationMs) * 100);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '290px',
        background: 'rgba(14, 16, 24, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isExpert ? 'rgba(192, 132, 242, 0.35)' : 'rgba(255, 215, 0, 0.3)'}`,
        borderRadius: '14px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 16px rgba(255, 215, 0, 0.1)',
        padding: '12px 14px 10px',
        color: '#F8FAFC',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'rfzToastEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Toast Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: isExpert ? '#C084FC' : '#FFD700',
          }}
        >
          <span>{isExpert ? '🧠 Expert Briefing Applied' : '⚡ Better Calibrated'}</span>
        </div>
        <span
          style={{
            fontSize: '9.5px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#94A3B8',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {domain.toUpperCase()}
        </span>
      </div>

      {/* Validation Checklist Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '11px',
              color: '#CBD5E1',
              lineHeight: 1.3,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                fontSize: '9px',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {onCopy && (
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.14s ease',
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          )}

          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#F87171',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.14s ease',
              }}
            >
              ↩ Undo
            </button>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'color 0.12s',
            }}
            title="Dismiss"
          >
            ✕
          </button>
        )}
      </div>

      {/* Countdown Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: isExpert
              ? 'linear-gradient(90deg, #A855F7, #EC4899)'
              : 'linear-gradient(90deg, #FFD700, #10B981)',
            transition: 'width 0.05s linear',
            opacity: isHovered ? 0.4 : 1,
          }}
        />
      </div>

      <style>{`
        @keyframes rfzToastEnter {
          from { opacity: 0; transform: translateY(6px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
