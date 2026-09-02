import elevenlabsProvider from '../providers/elevenlabs.js';
import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

export async function generateVoiceSummary({ userId, text, apiKey, voiceId }) {
  if (!apiKey || !voiceId) {
    throw new ProviderError('ElevenLabs credentials not configured for user', 'elevenlabs');
  }

  try {
    const audioBuffer = await elevenlabsProvider.generateVoice(text, voiceId, {
      apiKey,
      model_id: 'eleven_multilingual_turbo_v2',
      stability: 0.5,
      similarity_boost: 0.75,
    });

    logger.info('Voice summary generated', { userId, audioBytes: audioBuffer.byteLength });
    return audioBuffer;
  } catch (err) {
    logger.error('Voice generation failed', { userId, error: err.message });
    throw err;
  }
}
