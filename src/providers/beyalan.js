import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

const API_KEY = process.env.BEYALAN_API_KEY;
const BASE_URL = 'https://api.beyalan.com/v1';

export async function queryBeyalan(prompt, options = {}) {
  if (!API_KEY) {
    throw new ProviderError('Beyalan API key not configured', 'beyalan');
  }

  const body = {
    query: prompt,
    ...(options.depth !== undefined ? { depth: options.depth } : { depth: 1 }),
    ...(options.analysisType ? { analysis_type: options.analysisType } : {}),
  };

  try {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      if (res.status === 401) throw new ProviderError('Beyalan API key invalid', 'beyalan');
      if (res.status === 429) throw new ProviderError('Beyalan rate limited', 'beyalan');
      throw new ProviderError(`Beyalan API error: ${res.status}`, 'beyalan');
    }

    const data = await res.json();
    logger.info('Beyalan API call completed', { provider: 'beyalan' });
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ProviderError('Beyalan API timeout', 'beyalan', err);
    }
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('Beyalan API request failed', 'beyalan', err);
  }
}

export async function testConnection() {
  if (!API_KEY) return { available: false, reason: 'API key not configured' };
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    return { available: res.ok, status: res.status };
  } catch {
    return { available: false, reason: 'Connection failed' };
  }
}

export default { queryBeyalan, testConnection, name: 'beyalan' };
