import handler from './api/v1/refine.js';

function createMockRes(label) {
  let responseData = null;
  let responseCode = 200;
  return {
    status: (code) => {
      responseCode = code;
      return {
        json: (data) => {
          responseData = data;
          console.log(`[${label}] Status: ${code}`, data.error ? `Error: ${data.error.code} - ${data.error.message}` : `Success (${data.model})`);
        },
        end: () => console.log(`[${label}] Response ended`)
      };
    },
    setHeader: () => {},
    getResult: () => ({ code: responseCode, data: responseData })
  };
}

async function testGateway() {
  console.log('1. Testing Model Execution on Alibaba MaaS via Gateway...');
  const res1 = createMockRes('MaaS-Qwen3.8');
  await handler({
    method: 'POST',
    headers: { 'x-device-token': 'device-test-1' },
    body: {
      text: 'Write a python script to check memory',
      systemPrompt: 'Respond in JSON: {"prompt": "...", "shortReason": "..."}',
      model: 'qwen3.8-flash'
    }
  }, res1);

  console.log('\n2. Testing 25/day Rate Limiting Boundary...');
  const spamDeviceId = 'device-quota-test';
  let blockedAt = null;

  for (let i = 1; i <= 26; i++) {
    const res = createMockRes(`Req-${i}`);
    await handler({
      method: 'POST',
      headers: { 'x-device-token': spamDeviceId },
      body: {
        text: 'Quick test ' + i,
        model: 'qwen3.7-flash'
      }
    }, res);

    const result = res.getResult();
    if (result.code === 429) {
      blockedAt = i;
      console.log(`✓ Successfully rate-limited at request #${i} with HTTP 429: ${result.data?.error?.code}`);
      break;
    }
  }

  console.log('\n3. Testing BYOK Bypass when Quota Exceeded...');
  // The same device that was blocked on request #26 tries with a BYOK key:
  const byokRes = createMockRes('BYOK-Request');
  await handler({
    method: 'POST',
    headers: {
      'x-device-token': spamDeviceId,
      'x-api-key': 'sk-ws-H.DHEDELI.W1Ev.MEQCIBndZuPUmyFObeAEznxRo5_vRM1KL7ogMZ4xuDasQT0bAiBQkJ_ZIuarKYx2TlQ56jAatDvA6t6jaxN0bXhbRHsBxQ'
    },
    body: {
      text: 'BYOK test bypassing daily cap',
      model: 'qwen3.8-flash'
    }
  }, byokRes);

  const byokResult = byokRes.getResult();
  if (byokResult.code === 200) {
    console.log('✓ BYOK request successfully bypassed the daily cap (HTTP 200)!');
  } else {
    console.error('✗ BYOK request failed:', byokResult);
  }
}

testGateway();
