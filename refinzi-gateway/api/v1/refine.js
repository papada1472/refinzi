import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import crypto from 'crypto';

const ALLOWED_MODELS = [
  // Alibaba Cloud MaaS (Default Backend)
  'qwen3.8-flash',
  'deepseek-v4.1-flash',
  'qwen3.7-flash',
  'gateway-default',
  'openrouter/free',
  'openrouter/auto',
  // OpenRouter — current free pool
  'deepseek/deepseek-v4-flash-0731:free',
  'z-ai/glm-5.2:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
  'nex-agi/nex-n2.5-pro:free',
  'thinkingmachines/inkling:free',
  'inclusionai/ling-3.0-flash-vl:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'cohere/north-mini-code:free',
  // OpenRouter — paid
  'deepseek/deepseek-chat',
  // DeepSeek direct — current
  'deepseek-flash',
  'deepseek-v4-pro',
  // DeepSeek direct — legacy names still accepted upstream
  'deepseek-v4-flash',
  'deepseek-v4-flash-vision-exp',
  'deepseek-chat',
  'deepseek-reasoner',
  // Google Gemini
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-pro-latest'
];

const decodeKey = (b64) => typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
const DEFAULT_MAAS_ENDPOINT = process.env.MAAS_ENDPOINT || 'https://ws-ls7my6kl6a1yzk90.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MAAS_API_KEY = process.env.MAAS_API_KEY || process.env.BAI_API_KEY || decodeKey('c2std3MtSC5ESEVERUxJLlcxRXYuTUVRQ0lCbmRadVBVbXlGT2JlQUV6bnhSbzVfdlJNMUtMN29nTVo0eHVEYXNRVDBiQWlCUWtKX1pJdWFyS1l4MlRsUTU2akFhdER2QTZ0NmpheE4wYlhoYlJIc0J4UQ==');

// Gateway-issued tokens (vck_ prefix) indicate use of server-side API keys
const isGatewayToken = (key) => typeof key === 'string' && key.startsWith('vck_');

export const maxDuration = 60;

export default async function handler(req, res) {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Authorization, x-api-key, x-beta-token, x-device-token'
  );

  // Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Request Body Size Limit Check (Max 100KB)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 102400) {
    return res.status(413).json({ error: 'Payload too large. Maximum request size is 100KB.' });
  }

  const { text, systemPrompt, apiKey: bodyApiKey, model: requestedModel } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or invalid text input' });
  }

  if (requestedModel && !ALLOWED_MODELS.includes(requestedModel)) {
    return res.status(400).json({ error: `Disallowed model requested: ${requestedModel}` });
  }

  const authHeader = req.headers['authorization'] || '';
  const headerApiKey = req.headers['x-api-key'] || (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '');
  const betaToken = req.headers['x-beta-token'] || req.headers['x-device-token'] || '';

  const userProvidedKey = bodyApiKey || headerApiKey;
  const expectedBetaSecret = process.env.REFINZI_BETA_SECRET || process.env.REFINZI_GATEWAY_SECRET;

  // Gateway-issued tokens (vck_ prefix) are treated as "use server keys" — pass auth but don't forward key upstream
  const isGatewayIssuedToken = isGatewayToken(userProvidedKey);

  // Gateway-issued tokens use server-side keys only; user-provided keys are forwarded upstream
  const upstreamApiKey = isGatewayIssuedToken ? null : userProvidedKey;
  // Default backend is MaaS (Qwen/DeepSeek); Gemini/OpenRouter remain available for BYOK
  const apiKey = upstreamApiKey || DEFAULT_MAAS_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

  // Authorization: if a beta secret is configured, keyless requests must present
  // it — unless public gateway access is explicitly enabled.
  const allowPublic = process.env.ALLOW_PUBLIC_GATEWAY === 'true';
  if (!userProvidedKey && expectedBetaSecret && betaToken !== expectedBetaSecret && !allowPublic) {
    console.warn(`[Gateway][${requestId}] Unauthorized request rejected. Length: ${text.length}`);
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid beta token' });
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: No valid provider API key configured on gateway' });
  }

  const start = Date.now();

  // 1. Primary Default: Alibaba Cloud MaaS / Qwen 3.8 / DeepSeek V4.1 / Qwen 3.7
  const isMaasModel = requestedModel === 'qwen3.8-flash' || requestedModel === 'deepseek-v4.1-flash' || requestedModel === 'qwen3.7-flash';
  const wantsMaas = isMaasModel || requestedModel === 'gateway-default' || (!requestedModel && !isGeminiFormat);
  if (wantsMaas) {
    const maasModel = isMaasModel ? requestedModel : (process.env.DEFAULT_MODEL || 'qwen3.8-flash');
    const maasKey = (isGatewayIssuedToken || !upstreamApiKey) ? DEFAULT_MAAS_API_KEY : upstreamApiKey;
    try {
      const maasRes = await fetch(`${DEFAULT_MAAS_ENDPOINT.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${maasKey}`
        },
        body: JSON.stringify({
          model: maasModel,
          enable_thinking: false,
          response_format: { type: 'json_object' },
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: text }
          ],
          temperature: 0.4
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (maasRes.ok) {
        const maasData = await maasRes.json();
        const refinedText = maasData.choices?.[0]?.message?.content || maasData.choices?.[0]?.message?.reasoning_content;
        if (refinedText) {
          console.log(`[Gateway][${requestId}] MaaS (${maasModel}) success in ${Date.now() - start}ms`);
          return res.status(200).json({
            success: true,
            refinedText,
            model: maasModel,
            latencyMs: Date.now() - start,
            requestId
          });
        }
      } else {
        const errText = await maasRes.text().catch(() => '');
        console.warn(`[Gateway][${requestId}] MaaS (${maasModel}) HTTP ${maasRes.status}: ${errText.slice(0, 120)}`);
      }
    } catch (mErr) {
      console.error(`[Gateway][${requestId}] MaaS (${maasModel}) failed:`, mErr?.message || mErr);
    }
  }

  // 2. Google Gemini (BYOK key or server GEMINI_API_KEY)
  const isGeminiFormat = apiKey && (apiKey.startsWith('AIza') || apiKey.startsWith('AQ.'));
  const geminiKey = isGeminiFormat ? apiKey : process.env.GEMINI_API_KEY;
  const wantsGemini = !!geminiKey && (
    (requestedModel && requestedModel.startsWith('gemini')) ||
    (!requestedModel && isGeminiFormat)
  );
  if (wantsGemini) {
    const geminiModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.7-flash'];
    for (const gModel of geminiModels) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiKey
          },
          body: JSON.stringify({
            system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.6
            }
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const refinedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (refinedText) {
            console.log(`[Gateway][${requestId}] Direct Gemini (${gModel}) success in ${Date.now() - start}ms`);
            return res.status(200).json({
              success: true,
              refinedText,
              model: gModel,
              latencyMs: Date.now() - start,
              requestId
            });
          }
        } else {
          const errText = await geminiRes.text().catch(() => '');
          console.warn(`[Gateway][${requestId}] Direct Gemini (${gModel}) HTTP ${geminiRes.status}: ${errText.slice(0, 120)}`);
        }
      } catch (gErr) {
        console.error(`[Gateway][${requestId}] Direct Gemini (${gModel}) failed:`, gErr?.message || gErr);
      }
    }
  }

  // 2. DeepSeek (default backend) — used when no explicit model is requested or
  // when the request targets DeepSeek directly.
  const isDeepSeekKey = apiKey && apiKey.startsWith('sk-') && !apiKey.startsWith('sk-or-');
  const deepSeekKey = isDeepSeekKey ? apiKey : process.env.DEEPSEEK_API_KEY;
  const wantsDeepSeek = !!deepSeekKey && (
    requestedModel === 'gateway-default' ||
    (requestedModel && requestedModel.includes('deepseek')) ||
    (!requestedModel && !isGeminiFormat && !apiKey?.startsWith('sk-or-'))
  );
  if (wantsDeepSeek) {
    // Map legacy/aliased model IDs onto the current DeepSeek lineup.
    const isProModel = requestedModel === 'deepseek-v4-pro'
      || requestedModel === 'deepseek-reasoner'
      || requestedModel?.includes('r1');
    const dsModel = isProModel ? 'deepseek-v4-pro' : 'deepseek-flash';
    try {
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekKey}`
        },
        body: JSON.stringify({
          model: dsModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: text }
          ],
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        const refinedText = dsData.choices?.[0]?.message?.content;
        if (refinedText) {
          console.log(`[Gateway][${requestId}] Direct DeepSeek (${dsModel}) success in ${Date.now() - start}ms`);
          return res.status(200).json({
            success: true,
            refinedText,
            model: dsModel,
            latencyMs: Date.now() - start,
            requestId
          });
        }
      }
    } catch (dsErr) {
      console.error(`[Gateway][${requestId}] Direct DeepSeek failed:`, dsErr?.message || dsErr);
    }
  }

  // 3. Fallback to OpenRouter
  const isOpenRouterKey = apiKey && apiKey.startsWith('sk-or-');
  const openRouterKey = isOpenRouterKey ? apiKey : process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
      headers: {
        'HTTP-Referer': 'https://refinzi.com',
        'X-Title': 'Refinzi Gateway'
      }
    });

    const DEFAULT_MODEL_ORDER = [
      'deepseek/deepseek-v4-flash-0731:free',
      'z-ai/glm-5.2:free',
      'google/gemma-4-31b-it:free',
      'qwen/qwen3.8-27b:free',
      'nex-agi/nex-n2.5-pro:free',
      'openrouter/free'
    ];

    const targetModels = (requestedModel && ALLOWED_MODELS.includes(requestedModel) && requestedModel !== 'gateway-default')
      ? [requestedModel]
      : DEFAULT_MODEL_ORDER;

    for (const modelName of targetModels) {
      try {
        const { text: refinedText } = await generateText({
          model: openrouter(modelName),
          system: systemPrompt,
          prompt: text,
          abortSignal: AbortSignal.timeout(10000)
        });

        if (refinedText) {
          console.log(`[Gateway][${requestId}] OpenRouter model ${modelName} success in ${Date.now() - start}ms`);
          return res.status(200).json({
            success: true,
            refinedText,
            model: modelName,
            latencyMs: Date.now() - start,
            requestId
          });
        }
      } catch (error) {
        console.error(`[Gateway][${requestId}] OpenRouter ${modelName} failed:`, error?.message || error);
        continue;
      }
    }
  }

  return res.status(500).json({
    error: {
      message: 'All gateway providers failed. Please check your Gemini, DeepSeek, or OpenRouter API key in Refinzi Settings.'
    },
    requestId
  });
}

