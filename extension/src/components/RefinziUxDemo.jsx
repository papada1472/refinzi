import React, { useState, useRef } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { ProcessingFeedback } from './ProcessingFeedback';
import { ValidationToast } from './ValidationToast';
import { ApiKeyGuideBook } from './ApiKeyGuideBook';

/**
 * REFINZI — Master UX Playground & Interactive Showcase
 * Unites:
 * 1. Feature 1: First-Run Onboarding Modal (Zero friction, click vs hold)
 * 2. Feature 2: Processing Feedback Animation (Perceived value, multi-stage kinetic scan)
 * 3. Feature 3: Validation Checklist Toast (Tangible value proof, pause on hover, auto-dismiss)
 * 4. API & BYOK Configuration + Guide Book (Gemini Flash default, interactive docs)
 */
export function RefinziUxDemo() {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'api'
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inputValue, setInputValue] = useState('write an email to decline a client discount request');
  const [previousValue, setPreviousValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState('better'); // 'better' | 'expert'
  const [toastData, setToastData] = useState(null);

  // Orb Press State for Click vs Hold
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Mock Refined Outputs
  const BETTER_OUTPUT = `Subject: Following up on your pricing inquiry regarding [Project Name]

Dear [Client Name],

Thank you for reaching out and sharing your goals for [Project Name]. We are genuinely excited about the opportunity to partner with your team.

Regarding your request for a discount on our proposal: our pricing directly reflects the dedicated senior resources, rigorous quality assurance, and scope required to deliver high-impact results without compromise. To ensure you receive our highest standard of execution, we are unable to reduce the quoted fee.

However, if working within a specific budget constraint is your primary objective, we would be glad to explore adjusting the project scope—such as phasing deliverables or focusing first on core milestones—to meet your target.

Please let me know if you would like to schedule a brief call this week to align on the best path forward.

Best regards,
[Your Name]
[Your Title]`;

  const EXPERT_OUTPUT = `Context & Goal:
Write a firm, professional, and relationship-preserving email declining a client's request for a fee discount while maintaining momentum toward closing the deal.

Strategic Directives:
1. Acknowledge and validate the client's position without apologizing for current pricing.
2. Anchor the value: articulate that fees reflect dedicated senior specialists, uncompromised delivery velocity, and SLA guarantees.
3. Present non-price negotiation levers (e.g., phased delivery, deferred milestone, adjusted scope scope boundary).
4. Include a clear, low-friction call-to-action to finalize next steps.

Draft Email:
Subject: Options for moving forward with [Project Name]

Hi [Client Name],

Thank you for the candid discussion regarding the proposal for [Project Name]. We are thrilled about the prospect of working together to achieve [Primary Client Objective].

Regarding the discount request: our pricing structure is directly indexed to the dedicated senior expertise, custom testing protocols, and fast delivery timelines required to guarantee the results we promised. To maintain this level of execution, we cannot reduce the fee for the proposed scope.

That said, we want to make this work within your current budget allocations. Here are two viable paths forward:
• Option A (Scope Phasing): Deliver Phase 1 ([Key Milestone]) at [Budget A] to unlock immediate ROI, postponing secondary modules to Q2.
• Option B (Payment Structure): Maintain full scope with restructured milestone payments across [Number] installments.

Let me know which option aligns best with your quarterly goals, or if 15 minutes tomorrow at 2 PM works to finalize the agreement.

Warm regards,
[Your Name]
[Your Title]`;

  const handleOrbMouseDown = (e) => {
    e.preventDefault();
    startTimeRef.current = Date.now();
    setPressProgress(0);

    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / 450) * 100);
      setPressProgress(progress);

      if (elapsed >= 450) {
        clearInterval(pressTimerRef.current);
        triggerRefinement('expert');
      }
    }, 20);
  };

  const handleOrbMouseUp = (e) => {
    e.preventDefault();
    const elapsed = Date.now() - startTimeRef.current;
    clearInterval(pressTimerRef.current);
    setPressProgress(0);

    if (elapsed < 450 && elapsed > 20) {
      triggerRefinement('better');
    }
  };

  const triggerRefinement = (mode) => {
    if (isProcessing) return;
    setPreviousValue(inputValue);
    setCurrentMode(mode);
    setIsProcessing(true);
    setToastData(null);

    // Emulate network latency + kinetic processing sequence (450ms)
    setTimeout(() => {
      setIsProcessing(false);
      setInputValue(mode === 'expert' ? EXPERT_OUTPUT : BETTER_OUTPUT);

      // Trigger Feature 3: Validation Checklist Toast
      setToastData({
        mode,
        domain: 'Business / Communication',
        checklist:
          mode === 'expert'
            ? [
                'Exact refusal objective preserved with zero apologetic tone',
                'Value anchored to senior execution & SLA commitments',
                'Two non-discount counter-options introduced (scope & phasing)',
                'Low-friction call-to-action added',
              ]
            : [
                'Deconstructed vague request into professional corporate tone',
                'Removed defensive phrasing and eliminated ambiguities',
                'Calibrated actionable closing invitation',
              ],
      });
    }, 550);
  };

  const handleUndo = () => {
    if (previousValue) {
      setInputValue(previousValue);
      setToastData(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090A0F',
        color: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#0B0D14"
                stroke="#0B0D14"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
                Refinzi 2.1.0
              </h1>
              <span
                style={{
                  background: 'rgba(255, 215, 0, 0.12)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                }}
              >
                UX SUITE
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>
              Zero Friction Architecture • Click = Better • Hold = Expert
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('demo')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'demo' ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'demo' ? 'rgba(255, 215, 0, 0.12)' : 'transparent',
              color: activeTab === 'demo' ? '#FFD700' : '#94A3B8',
              transition: 'all 0.15s ease',
            }}
          >
            Live UX Sandbox
          </button>
          <button
            onClick={() => setActiveTab('api')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'api' ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'api' ? 'rgba(255, 215, 0, 0.12)' : 'transparent',
              color: activeTab === 'api' ? '#FFD700' : '#94A3B8',
              transition: 'all 0.15s ease',
            }}
          >
            BYOK & Guide Book
          </button>
          <button
            onClick={() => setShowOnboarding(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💡</span> Onboarding Modal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        {activeTab === 'demo' ? (
          <div>
            {/* Feature Description Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  background: 'rgba(18, 20, 31, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFD700', marginBottom: '4px' }}>
                  FEATURE 1: ZERO-FRICTION ONBOARDING
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Educates first-time users on <strong>Click (Better)</strong> vs <strong>Hold (Expert)</strong> without
                  annoying clicks. Self-dismisses or completes on sample press.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(18, 20, 31, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA', marginBottom: '4px' }}>
                  FEATURE 2: KINETIC PROCESSING FEEDBACK
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Replaces instant jump with a 450ms kinetic scanning pulse &amp; stage pill (Intent Lock → Calibrating
                  Constraints) to build perceived AI value.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(18, 20, 31, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#C084FC', marginBottom: '4px' }}>
                  FEATURE 3: VALIDATION CHECKLIST TOAST
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Floating non-intrusive toast showing tangible improvements made. Features a 6s progress bar that
                  pauses on hover and 1-click Undo.
                </div>
              </div>
            </div>

            {/* Interactive Browser Surface Simulator */}
            <div
              style={{
                background: '#11131F',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}
            >
              {/* Fake Browser Chrome */}
              <div
                style={{
                  background: '#0D0F18',
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div
                  style={{
                    flex: 1,
                    maxWidth: '420px',
                    margin: '0 auto',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    color: '#94A3B8',
                    textAlign: 'center',
                  }}
                >
                  🔒 https://any-website.com/editable-input-field
                </div>
              </div>

              {/* Surface Workspace */}
              <div style={{ padding: '24px', position: 'relative' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                    Universal Browser Text Input (Click or Hold the Orb)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setInputValue('write an email to decline a client discount request')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Reset Prompt
                    </button>
                  </div>
                </div>

                {/* Processing Feedback Wrapper around the Input */}
                <ProcessingFeedback
                  mode={currentMode}
                  isProcessing={isProcessing}
                  onComplete={() => {}}
                >
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      rows={12}
                      placeholder="Type any prompt here to see Refinzi operate on any browser text surface..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: '#090A10',
                        color: '#F8FAFC',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        padding: '16px 54px 16px 16px',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />

                    {/* Active Hold Nudge Pill */}
                    {pressProgress > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '62px',
                          top: '20px',
                          zIndex: 100,
                          background: pressProgress >= 100 ? 'rgba(6, 78, 59, 0.96)' : 'rgba(15, 17, 26, 0.96)',
                          border: `1px solid ${pressProgress >= 100 ? '#10B981' : 'rgba(255, 215, 0, 0.5)'}`,
                          borderRadius: '999px',
                          padding: '5px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: pressProgress >= 100 ? '#A7F3D0' : '#F8FAFC',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: pressProgress >= 100 ? '#10B981' : '#FFD700',
                          }}
                        />
                        <span>
                          {pressProgress >= 100
                            ? '🧠 Release for Expert Briefing!'
                            : '⚡ Hold for Expert…'}
                        </span>
                      </div>
                    )}

                    {/* Floating Orb attached to Input Corner */}
                    <div
                      onMouseDown={handleOrbMouseDown}
                      onMouseUp={handleOrbMouseUp}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '16px',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background:
                          pressProgress > 50
                            ? 'radial-gradient(circle at 35% 35%, #E879F9, #9333EA)'
                            : 'radial-gradient(circle at 35% 35%, #FFE066, #E5A500)',
                        boxShadow:
                          pressProgress > 50
                            ? '0 0 20px rgba(168, 85, 247, 0.7)'
                            : '0 0 16px rgba(255, 215, 0, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        transition: 'transform 0.15s ease, background 0.3s ease',
                        transform: isProcessing ? 'scale(0.92)' : pressProgress > 0 ? 'scale(1.12)' : 'scale(1)',
                        zIndex: 10,
                      }}
                      title="Click for Better (⚡) • Hold for Expert (🧠)"
                    >
                      {/* Radial Progress Ring for Hold */}
                      {pressProgress > 0 && (
                        <svg
                          style={{
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            width: 46,
                            height: 46,
                            transform: 'rotate(-90deg)',
                            pointerEvents: 'none',
                          }}
                        >
                          <circle
                            cx="23"
                            cy="23"
                            r="20"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2.5"
                            fill="none"
                          />
                          <circle
                            cx="23"
                            cy="23"
                            r="20"
                            stroke="#C084FC"
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray={125.6}
                            strokeDashoffset={125.6 - (125.6 * pressProgress) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}

                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                          fill={pressProgress > 50 ? '#FFF' : '#0B0D14'}
                          stroke={pressProgress > 50 ? '#FFF' : '#0B0D14'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </ProcessingFeedback>

                {/* Orb Instruction Hints */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#94A3B8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FFD700', fontWeight: 700 }}>● Single Click:</span>
                    <span>Better (instant clarity &amp; structure)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#C084FC', fontWeight: 700 }}>● Hold 450ms:</span>
                    <span>Expert (deep constraints &amp; assumptions)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Checklist Toast (Feature 3) Positioned Below Input */}
            {toastData && (
              <div style={{ marginTop: '20px' }}>
                <ValidationToast
                  mode={toastData.mode}
                  domain={toastData.domain}
                  checklist={toastData.checklist}
                  onUndo={handleUndo}
                  onClose={() => setToastData(null)}
                />
              </div>
            )}
          </div>
        ) : (
          <ApiKeyGuideBook
            initialProvider="gemini"
            onSave={(provider, key, model) => {
              alert(`Saved settings for ${provider.toUpperCase()}:\nModel: ${model}\nKey: ${key.slice(0, 7)}...`);
            }}
          />
        )}
      </div>

      {/* Feature 1: First-Run Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onDismiss={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

export default RefinziUxDemo;
