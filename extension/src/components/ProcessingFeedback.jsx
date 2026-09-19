import React, { useState, useEffect } from 'react';

/**
 * REFINZI — Processing Feedback Animation (React Component)
 * Feature 2: Show the "work" being done to build perceived value, replacing the instant swap with a brief, satisfying sequence.
 */
export function ProcessingFeedback({
  mode = 'better', // 'better' | 'expert'
  domain = 'marketing',
  isProcessing = true,
  onComplete,
  children,
}) {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    if (!isProcessing) {
      setStage(1);
      return;
    }

    // Stage 1: 0ms -> Scan / Intent Lock
    setStage(1);

    // Stage 2: 240ms -> Parameter Calibration
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 240);

    // Stage 3: 450ms -> Settle & Done
    const timer2 = setTimeout(() => {
      setStage(3);
      if (onComplete) onComplete();
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isProcessing, onComplete]);

  const isExpert = mode === 'expert';

  const stageLabel =
    stage === 1
      ? isExpert
        ? '🧠 Working: Locking scope & task…'
        : '⚡ Working: Deconstructing intent…'
      : stage === 2
      ? isExpert
        ? '🧠 Improving: Calibrating constraints…'
        : '⚡ Improving: Polishing prompt clarity…'
      : isExpert
      ? '✓ Expert briefing assembled'
      : '✓ Better calibrated';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Active Surface Shimmer Container */}
      <div
        style={{
          position: 'relative',
          borderRadius: '12px',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          boxShadow: isProcessing
            ? isExpert
              ? '0 0 0 2px rgba(192, 132, 252, 0.4), 0 0 20px rgba(192, 132, 252, 0.2)'
              : '0 0 0 2px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.18)'
            : 'none',
        }}
      >
        {children}

        {/* Ambient Stage Pill Overlay */}
        {isProcessing && (
          <div
            style={{
              position: 'absolute',
              top: '-36px',
              right: '8px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 17, 26, 0.96)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isExpert ? 'rgba(192, 132, 252, 0.45)' : 'rgba(255, 215, 0, 0.4)'}`,
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#F8FAFC',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              animation: 'rfzPillEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isExpert ? '#C084FC' : '#FFD700',
                boxShadow: `0 0 8px ${isExpert ? '#C084FC' : '#FFD700'}`,
                display: 'inline-block',
                animation: 'rfzPulseDot 0.8s infinite alternate ease-in-out',
              }}
            />
            <span>{stageLabel}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rfzPillEnter {
          from { opacity: 0; transform: translateY(4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rfzPulseDot {
          from { opacity: 0.3; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
