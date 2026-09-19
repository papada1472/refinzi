import React, { useState, useEffect, useRef } from 'react';

/**
 * REFINZI — First-Run Onboarding Modal (React Component)
 * Feature 1: Educate first-time users on the "Click vs. Hold" mechanic without being annoying.
 * Philosophy: Zero Friction.
 */
export function OnboardingModal({ isOpen = true, onClose, onComplete }) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [activeMode, setActiveMode] = useState(null); // 'better' | 'expert'
  const [demoText, setDemoText] = useState('write landing page hero for developer tool');
  const [hasInteracted, setHasInteracted] = useState(false);

  const holdStartRef = useRef(0);
  const animFrameRef = useRef(null);
  const HOLD_THRESHOLD_MS = 350;

  // Keyboard accessibility: Escape to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    if (onClose) onClose();
    if (onComplete) onComplete({ hasSeenOnboarding: true });
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const updateRing = () => {
      const elapsed = performance.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_THRESHOLD_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        // Hold threshold achieved -> Expert Mode
        setIsHolding(false);
        setActiveMode('expert');
        setHasInteracted(true);
        setDemoText(
          'Write the hero section for a developer tool landing page. Create: 3 outcome-oriented headlines, concise subheadline, primary CTA, and technical proof points. Keep scope strictly limited to the hero section.'
        );
        return;
      }
      animFrameRef.current = requestAnimationFrame(updateRing);
    };

    animFrameRef.current = requestAnimationFrame(updateRing);
  };

  const handlePointerUp = () => {
    if (!isHolding) return;
    const elapsed = performance.now() - holdStartRef.current;
    setIsHolding(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setHoldProgress(0);

    if (elapsed < HOLD_THRESHOLD_MS) {
      // Tap / Short Click -> Better Mode
      setActiveMode('better');
      setHasInteracted(true);
      setDemoText(
        'Write a compelling landing page hero section for a developer tool. Include a strong developer-focused headline, clear value proposition, and primary CTA.'
      );
    }
  };

  if (!isOpen) return null;

  const circumference = 106.8;
  const strokeDashoffset = circumference * (1 - holdProgress);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8, 9, 14, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '16px',
        animation: 'rfzFadeIn 0.25s ease-out',
      }}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          background: 'radial-gradient(circle at 50% 0%, #1E202B 0%, #0E1017 100%)',
          border: '1px solid rgba(255, 215, 0, 0.28)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(255, 215, 0, 0.12)',
          padding: '28px 28px 24px',
          color: '#F8FAFC',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            borderRadius: '50%',
            transition: 'color 0.15s ease',
          }}
          title="Close (Esc)"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#FFD700',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          ✨ Welcome to Refinzi
        </div>

        <h2
          id="onboarding-title"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.4px',
            lineHeight: 1.3,
            marginBottom: '8px',
          }}
        >
          Any Text Box.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #FFE066 0%, #FFD700 60%, #FF9500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Zero Friction.
          </span>
        </h2>

        <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '20px' }}>
          Refinzi docks an ambient Orb beside editable text surfaces across the web. Type naturally
          and let Refinzi handle calibration in-place.
        </p>

        {/* Mechanics Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Better Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${activeMode === 'better' ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '14px',
              padding: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 215, 0, 0.16)',
                color: '#FFD700',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '2px 8px',
                marginBottom: '8px',
              }}
            >
              ⚡ CLICK
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F5F9', marginBottom: '4px' }}>
              Better Mode
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
              Instant task calibration. Eliminates ambiguity and sharpens tone without altering your request.
            </div>
          </div>

          {/* Expert Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${activeMode === 'expert' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '14px',
              padding: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(168, 85, 247, 0.18)',
                color: '#C084FC',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '2px 8px',
                marginBottom: '8px',
              }}
            >
              🧠 HOLD (350ms)
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F5F9', marginBottom: '4px' }}>
              Expert Mode
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
              Deep execution briefing. Adds missing dimensions, constraints, and defensible baseline assumptions.
            </div>
          </div>
        </div>

        {/* Live Interactive Simulator Sandbox */}
        <div
          style={{
            background: 'rgba(10, 11, 16, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            <span>Interactive Simulator</span>
            <span
              style={{
                fontSize: '11px',
                color: activeMode === 'expert' ? '#C084FC' : activeMode === 'better' ? '#FFD700' : '#10B981',
                fontWeight: 600,
              }}
            >
              {activeMode === 'expert'
                ? '🧠 Expert Mode (Hold 350ms)'
                : activeMode === 'better'
                ? '⚡ Better Mode (Click)'
                : '⚡ Click or Hold Orb below'}
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${hasInteracted ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '10px',
              padding: '12px 14px',
              minHeight: '60px',
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: '13px',
                color: hasInteracted ? '#FFE066' : '#F8FAFC',
                lineHeight: 1.45,
                paddingRight: '46px',
                transition: 'color 0.2s ease',
              }}
            >
              {demoText}
            </div>

            {/* Interactive Simulator Orb */}
            <div
              role="button"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: `translateY(-50%) scale(${isHolding ? 1.15 : 1})`,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #2A2720 0%, #151411 70%, #0A0908 100%)',
                border: '1.2px solid rgba(255, 215, 0, 0.6)',
                boxShadow: isHolding
                  ? '0 0 24px rgba(168, 85, 247, 0.8)'
                  : '0 0 16px rgba(255, 215, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              }}
              title="Click for Better, Hold for Expert"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3.5 13.5H11.5L10.5 22L20.5 10.5H12.5L13 2Z"
                  fill="url(#react-demo-gold)"
                />
                <defs>
                  <linearGradient id="react-demo-gold" x1="3.5" y1="2" x2="20.5" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFDF0" />
                    <stop offset="0.5" stopColor="#FFD700" />
                    <stop offset="1" stopColor="#FF9500" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Circular Hold Progress Ring */}
              <svg
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  width: '42px',
                  height: '42px',
                  pointerEvents: 'none',
                }}
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2.8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 20 20)"
                  style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #FFD700 0%, #FF9500 100%)',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '14px',
              padding: '11px 20px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(255, 215, 0, 0.35)',
              transition: 'all 0.16s ease',
            }}
          >
            Got It — Start Using Refinzi →
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginTop: '10px' }}>
          Press <span style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>Esc</span> anytime to dismiss. Replay anytime from Settings.
        </div>
      </div>
    </div>
  );
}
