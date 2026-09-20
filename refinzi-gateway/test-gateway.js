import handler from './api/v1/refine.js';

function createMockRes(modelName) {
  return {
    status: (code) => ({
      json: (data) => {
        console.log(`[${modelName}] Status: ${code}`);
        console.log(`[${modelName}] Model used:`, data.model);
        console.log(`[${modelName}] Latency:`, data.latencyMs, 'ms');
        console.log(`[${modelName}] Refined:`, typeof data.refinedText === 'string' ? data.refinedText.slice(0, 100) + '...' : data.refinedText);
      },
      end: () => console.log(`[${modelName}] Response ended`)
    }),
    setHeader: () => {}
  };
}

async function testAll() {
  const models = ['gateway-default', 'qwen3.8-flash', 'deepseek-v4.1-flash', 'qwen3.7-flash'];
  for (const m of models) {
    console.log(`\nTesting gateway handler with model: ${m}...`);
    const req = {
      method: 'POST',
      headers: {
        'x-beta-token': 'default'
      },
      body: {
        text: 'Write a python script to monitor memory usage',
        systemPrompt: 'You are an AI prompt calibration engine. Respond with a JSON object: {"prompt": "calibrated prompt"}',
        model: m
      }
    };
    await handler(req, createMockRes(m));
  }
}

testAll();
