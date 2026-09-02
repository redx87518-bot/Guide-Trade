import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

const BASE_URL = 'https://api.elevenlabs.io/v1';

export async function generateVoice(text, voiceId, apiKey, options = {}) {
  if (!apiKey) {
    throw new ProviderError('ElevenLabs API key not configured', 'elevenlabs');
  }
  if (!voiceId) {
    throw new ProviderError('ElevenLabs Voice ID not configured', 'elevenlabs');
  }

  try {
    const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        ...(options.model ? { model_id: options.model } : { model_id: 'eleven_multilingual_turbo_v2' }),
        ...(options.stability !== undefined ? { stability: options.stability } : { stability: 0.5 }),
        ...(options.similarityBoost !== undefined ? { similarity_boost: options.similarityBoost } : { similarity_boost: 0.75 }),
      }),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      if (res.status === 401) throw new ProviderError('ElevenLabs API key invalid', 'elevenlabs');
      if (res.status === 429) throw new ProviderError('ElevenLabs rate limited', 'elevenlabs');
      throw new ProviderError(`ElevenLabs API error: ${res.status}`, 'elevenlabs');
    }

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('audio')) {
      const arrayBuffer = await res.arrayBuffer();
      logger.info('ElevenLabs voice generated', { provider: 'elevenlabs', audioBytes: arrayBuffer.byteLength });
      return arrayBuffer;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ProviderError('ElevenLabs API timeout', 'elevenlabs', err);
    }
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('ElevenLabs voice generation failed', 'elevenlabs', err);
  }
}

export async function testVoice(apiKey, voiceId) {
  if (!apiKey || !voiceId) return { available: false, reason: 'Key or Voice ID not configured' };
  try {
    const res = await fetch(`${BASE_URL}/voices/get-all`, {
      headers: { 'xi-api-key': apiKey },
      signal: AbortSignal.timeout(10000),
    });
    return { available: res.ok, status: res.status };
  } catch {
    return { available: false, reason: 'Connection failed' };
  }
}

export default { generateVoice, testVoice, name: 'elevenlabs' };
