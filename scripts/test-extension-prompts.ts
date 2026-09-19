import { synthesizeBetterPrompt } from '../extension/src/engine/better';
import { synthesizeExpertPrompt } from '../extension/src/engine/expert';

const testPrompts = [
  {
    title: 'Prompt 1: GTM Strategy',
    input: 'GTM to enter in US market',
    targetAi: 'chatgpt'
  },
  {
    title: 'Prompt 2: Landing Page Copy',
    input: 'write landing page hero for developer tool',
    targetAi: 'claude'
  },
  {
    title: 'Prompt 3: Engineering / Debugging',
    input: 'fix memory leak in nodejs stream pipeline',
    targetAi: 'claude'
  },
  {
    title: 'Prompt 4: Image Generation',
    input: 'cinematic street photo of tokyo alley in rain',
    targetAi: 'midjourney'
  },
  {
    title: 'Prompt 5: Technical Research',
    input: 'compare postgres vs clickhouse for high throughput analytics',
    targetAi: 'chatgpt'
  },
  {
    title: 'Prompt 6: Client Communication',
    input: 'email to client apologizing for delayed project delivery',
    targetAi: 'general'
  }
];

console.log('='.repeat(80));
console.log('REFINZI EXTENSION PROMPT ENGINE TEST SUITE');
console.log('Testing Better (Click) and Expert (Hold) generation on representative prompts');
console.log('='.repeat(80));
console.log();

for (const test of testPrompts) {
  console.log(`\n================================================================================`);
  console.log(`INPUT: "${test.input}" (${test.targetAi})`);
  console.log(`================================================================================`);

  const betterResult = synthesizeBetterPrompt(test.input, test.targetAi);
  console.log('\n--- [CLICK / BETTER] ---');
  console.log(`Domain: ${betterResult.domain} | Focus: ${betterResult.calibratedDimensions?.join(', ')}`);
  console.log(betterResult.prompt);

  const expertResult = synthesizeExpertPrompt(test.input, test.targetAi);
  console.log('\n--- [HOLD / EXPERT] ---');
  console.log(`Domain: ${expertResult.domain} | Summary: ${expertResult.summary}`);
  console.log(`Assumptions: ${expertResult.assumptions?.join('; ') || 'None'}`);
  console.log(expertResult.prompt);
  console.log('\n');
}
