import { TaskDomain } from '../types';

export interface GoldenPrompt {
  id: string;
  rawInput: string;
  domain: TaskDomain;
  targetAi?: string;
  scopeRestriction?: 'hero_only' | 'email_only' | 'bug_fix_only' | 'headline_only' | 'image_only';
  expectedEntities?: string[];
}

export const GOLDEN_PROMPT_BENCHMARK: GoldenPrompt[] = [
  // ==========================================
  // 1. MARKETING & GROWTH
  // ==========================================
  { id: 'mkt-01', rawInput: 'GTM to enter in US market', domain: 'marketing', expectedEntities: ['US'] },
  { id: 'mkt-02', rawInput: 'write a hero section for an AI accounting SaaS', domain: 'marketing', scopeRestriction: 'hero_only', expectedEntities: ['hero'] },
  { id: 'mkt-03', rawInput: 'LinkedIn post about AI agents in customer support', domain: 'marketing', expectedEntities: ['LinkedIn', 'support'] },
  { id: 'mkt-04', rawInput: 'cold outreach email to VP of Sales for enterprise contract management', domain: 'marketing', scopeRestriction: 'email_only' },
  { id: 'mkt-05', rawInput: 'create 3 punchy headlines for a cybersecurity product launch', domain: 'marketing', scopeRestriction: 'headline_only' },
  { id: 'mkt-06', rawInput: 'product hunt launch description for developer CLI tool', domain: 'marketing', expectedEntities: ['Product Hunt'] },
  { id: 'mkt-07', rawInput: 'onboarding welcome email sequence hook for freemium B2B tool', domain: 'marketing' },
  { id: 'mkt-08', rawInput: 'Twitter thread analyzing why Notion won productivity market', domain: 'marketing', expectedEntities: ['Notion'] },
  { id: 'mkt-09', rawInput: 'positioning pitch for open-source vector database', domain: 'marketing' },
  { id: 'mkt-10', rawInput: 'growth marketing experiment plan to reduce signup churn', domain: 'marketing' },
  { id: 'mkt-11', rawInput: 'feature announcement newsletter for SOC2 certification milestone', domain: 'marketing' },
  { id: 'mkt-12', rawInput: 'value proposition comparison vs incumbent legacy ERP', domain: 'marketing' },

  // ==========================================
  // 2. CODE & ENGINEERING
  // ==========================================
  { id: 'code-01', rawInput: 'fix this React login bug where token is null on refresh', domain: 'code', scopeRestriction: 'bug_fix_only', expectedEntities: ['React', 'token'] },
  { id: 'code-02', rawInput: 'write a python script to stream large CSV files into PostgreSQL', domain: 'code', expectedEntities: ['python', 'PostgreSQL'] },
  { id: 'code-03', rawInput: 'refactor this Node.js authentication middleware for Redis session storage', domain: 'code', expectedEntities: ['Node.js', 'Redis'] },
  { id: 'code-04', rawInput: 'implement sliding window rate limiter in Go with unit tests', domain: 'code', expectedEntities: ['Go'] },
  { id: 'code-05', rawInput: 'TypeScript type definitions for a nested comment tree data structure', domain: 'code', expectedEntities: ['TypeScript'] },
  { id: 'code-06', rawInput: 'Docker multi-stage build file for Next.js 14 production app', domain: 'code', expectedEntities: ['Docker', 'Next.js'] },
  { id: 'code-07', rawInput: 'optimize this slow SQL query joining 5 million telemetry rows', domain: 'code', expectedEntities: ['SQL'] },
  { id: 'code-08', rawInput: 'WebSocket reconnect logic with exponential backoff and jitter', domain: 'code', expectedEntities: ['WebSocket'] },
  { id: 'code-09', rawInput: 'fix race condition in async distributed lock handler', domain: 'code', scopeRestriction: 'bug_fix_only' },
  { id: 'code-10', rawInput: 'unit test suite using vitest for payment checkout validation helper', domain: 'code', expectedEntities: ['vitest'] },
  { id: 'code-11', rawInput: 'Kubernetes deployment manifest with horizontal pod autoscaling', domain: 'code', expectedEntities: ['Kubernetes'] },
  { id: 'code-12', rawInput: 'Bash script to backup SQLite database to S3 with rotation', domain: 'code', expectedEntities: ['SQLite', 'S3'] },

  // ==========================================
  // 3. VISUAL / IMAGE GENERATION
  // ==========================================
  { id: 'img-01', rawInput: 'cool sports car in desert sunset', domain: 'image_gen', scopeRestriction: 'image_only', expectedEntities: ['desert', 'sunset'] },
  { id: 'img-02', rawInput: 'cinematic photo of a Ferrari in Tokyo at night with rain reflections', domain: 'image_gen', scopeRestriction: 'image_only', expectedEntities: ['Ferrari', 'Tokyo'] },
  { id: 'img-03', rawInput: 'macro photograph of a dew drop on a spiderweb during golden hour', domain: 'image_gen', scopeRestriction: 'image_only' },
  { id: 'img-04', rawInput: 'modern Scandinavian kitchen interior design with natural morning light', domain: 'image_gen', scopeRestriction: 'image_only' },
  { id: 'img-05', rawInput: '3D isometric render of a cozy cyberpunk developer workspace', domain: 'image_gen', scopeRestriction: 'image_only' },
  { id: 'img-06', rawInput: 'portrait of an elderly fisherman in Norway with weathered face and wool knit sweater', domain: 'image_gen', scopeRestriction: 'image_only', expectedEntities: ['Norway'] },
  { id: 'img-07', rawInput: 'architectural photo of brutalist concrete museum amidst pine forest', domain: 'image_gen', scopeRestriction: 'image_only' },
  { id: 'img-08', rawInput: 'editorial fashion shoot in minimalist industrial warehouse', domain: 'image_gen', scopeRestriction: 'image_only' },
  { id: 'img-09', rawInput: 'vintage 1970s film photo of coastal California highway road trip', domain: 'image_gen', scopeRestriction: 'image_only', expectedEntities: ['California'] },
  { id: 'img-10', rawInput: 'hyper-realistic studio product shot of matte black ceramic coffee mug', domain: 'image_gen', scopeRestriction: 'image_only' },

  // ==========================================
  // 4. MOTION / VIDEO GENERATION
  // ==========================================
  { id: 'vid-01', rawInput: 'drone flyover over rugged Icelandic black sand beach with crashing white waves', domain: 'video_gen', expectedEntities: ['Icelandic'] },
  { id: 'vid-02', rawInput: 'slow motion camera tracking shot of sprinter bursting off blocks', domain: 'video_gen' },
  { id: 'vid-03', rawInput: 'cinematic push-in shot of neon-lit ramen shop in rainy Kyoto alley', domain: 'video_gen', expectedEntities: ['Kyoto'] },
  { id: 'vid-04', rawInput: 'first-person FPV drone dive down vertical granite mountain cliff', domain: 'video_gen' },
  { id: 'vid-05', rawInput: 'orbital 360 rotation shot of concept electric vehicle on turntable', domain: 'video_gen' },
  { id: 'vid-06', rawInput: 'time-lapse footage of fog rolling over Golden Gate Bridge at sunrise', domain: 'video_gen', expectedEntities: ['Golden Gate Bridge'] },
  { id: 'vid-07', rawInput: 'steady tracking pan alongside high-speed bullet train passing cherry blossoms', domain: 'video_gen' },
  { id: 'vid-08', rawInput: 'underwater slow pan of sea turtle swimming above vibrant coral reef', domain: 'video_gen' },

  // ==========================================
  // 5. RESEARCH & MARKET INTELLIGENCE
  // ==========================================
  { id: 'res-01', rawInput: 'research competitors of Notion in India', domain: 'research', expectedEntities: ['Notion', 'India'] },
  { id: 'res-02', rawInput: 'comparative analysis of PostgreSQL vs MongoDB for high-frequency IoT timeseries data', domain: 'research', expectedEntities: ['PostgreSQL', 'MongoDB'] },
  { id: 'res-03', rawInput: 'investigate lithium iron phosphate battery supply chain risks in 2026', domain: 'research' },
  { id: 'res-04', rawInput: 'deep dive into semiconductor advanced packaging TSMC vs Intel', domain: 'research', expectedEntities: ['TSMC', 'Intel'] },
  { id: 'res-05', rawInput: 'executive synthesis of regulatory changes in EU AI Act compliance deadlines', domain: 'research', expectedEntities: ['EU'] },
  { id: 'res-06', rawInput: 'market landscape of open-source local LLM inference engines', domain: 'research' },
  { id: 'res-07', rawInput: 'benchmark report on Stripe vs Adyen interchange fees and global take rates', domain: 'research', expectedEntities: ['Stripe', 'Adyen'] },
  { id: 'res-08', rawInput: 'summary of recent clinical trials for GLP-1 agonists in cardiovascular health', domain: 'research' },

  // ==========================================
  // 6. WRITING & BUSINESS STRATEGY
  // ==========================================
  { id: 'biz-01', rawInput: 'write an apology email to an enterprise client for an unexpected 2-hour API outage', domain: 'writing', scopeRestriction: 'email_only' },
  { id: 'biz-02', rawInput: 'analyze why our CAC increased 40% quarter over quarter', domain: 'business', expectedEntities: ['CAC'] },
  { id: 'biz-03', rawInput: 'executive memo outlining our Q3 migration from AWS to bare metal infrastructure', domain: 'writing', expectedEntities: ['AWS'] },
  { id: 'biz-04', rawInput: 'salary negotiation email to hiring manager after receiving principal engineer offer', domain: 'writing', scopeRestriction: 'email_only' },
  { id: 'biz-05', rawInput: 'pricing tier restructuring proposal shifting from per-seat to usage-based billing', domain: 'business' },
  { id: 'biz-06', rawInput: 'briefing memo for upcoming investor board meeting regarding burn rate and runway', domain: 'business' },
  { id: 'biz-07', rawInput: 'polite but firm response to a vendor requesting an early contract renewal with price increase', domain: 'writing', scopeRestriction: 'email_only' },
  { id: 'biz-08', rawInput: 'operational post-mortem summary for data pipeline failure during Black Friday', domain: 'writing' },
];
