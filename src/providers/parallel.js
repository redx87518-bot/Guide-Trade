import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

const API_KEY = process.env.PARALLEL_API_KEY;
const BASE_URL = 'https://api.parallel.ai/v1';

export async function searchWeb(query, options = {}) {
  if (!API_KEY) {
    throw new ProviderError('Parallel API key not configured', 'parallel');
  }

  const body = {
    query,
    ...(options.maxResults ? { max_results: options.maxResults } : { max_results: 10 }),
    ...(options.recent ? { recency: options.recent } : { recency: 'week' }),
  };

  try {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      if (res.status === 401) throw new ProviderError('Parallel API key invalid', 'parallel');
      if (res.status === 429) throw new ProviderError('Parallel rate limited', 'parallel');
      throw new ProviderError(`Parallel API error: ${res.status}`, 'parallel');
    }

    const data = await res.json();
    logger.info('Parallel web search completed', { provider: 'parallel', results: data.results?.length });
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ProviderError('Parallel API timeout', 'parallel', err);
    }
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('Parallel API request failed', 'parallel', err);
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

export default { searchWeb, testConnection, name: 'parallel' };
