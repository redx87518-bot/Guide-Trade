import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

const API_KEY = process.env.QUAN_API_KEY;
const BASE_URL = 'https://api.stockupquan.com/v1';

export async function queryQuan(prompt, options = {}) {
  if (!API_KEY) {
    throw new ProviderError('Quan API key not configured', 'quan');
  }

  const body = {
    prompt,
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : { max_tokens: 2048 }),
    ...(options.temperature !== undefined ? { temperature: options.temperature } : { temperature: 0.7 }),
    ...(options.reasoning ? { reasoning: options.reasoning } : {}),
  };

  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      if (res.status === 401) throw new ProviderError('Quan API key invalid', 'quan');
      if (res.status === 429) throw new ProviderError('Quan rate limited', 'quan');
      throw new ProviderError(`Quan API error: ${res.status}`, 'quan');
    }

    const data = await res.json();
    logger.info('Quan API call completed', { provider: 'quan' });
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ProviderError('Quan API timeout', 'quan', err);
    }
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('Quan API request failed', 'quan', err);
  }
}

export async function testConnection() {
  if (!API_KEY) return { available: false, reason: 'API key not configured' };
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${APIKey}` },
      signal: AbortSignal.timeout(10000),
    });
    return { available: res.ok, status: res.status };
  } catch {
    return { available: false, reason: 'Connection failed' };
  }
}

export default { queryQuan, testConnection, name: 'quan' };
