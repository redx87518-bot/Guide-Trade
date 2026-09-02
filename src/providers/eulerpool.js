import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

const API_KEY = process.env.EULERPOOL_API_KEY;
const BASE_URL = 'https://api.eulerpool.com/v1';

export async function getFinancialData(symbol, options = {}) {
  if (!API_KEY) {
    throw new ProviderError('Eulerpool API key not configured', 'eulerpool');
  }

  const url = `${BASE_URL}/profile/${symbol}?datatype=${options.datatype || 'all'}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      if (res.status === 401) throw new ProviderError('Eulerpool API key invalid', 'eulerpool');
      if (res.status === 404) throw new ProviderError(`Symbol ${symbol} not found`, 'eulerpool');
      if (res.status === 429) throw new ProviderError('Eulerpool rate limited', 'eulerpool');
      throw new ProviderError(`Eulerpool API error: ${res.status}`, 'eulerpool');
    }

    const data = await res.json();
    logger.info('Eulerpool data retrieved', { provider: 'eulerpool', symbol });
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new ProviderError('Eulerpool API timeout', 'eulerpool', err);
    }
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('Eulerpool API request failed', 'eulerpool', err);
  }
}

export async function getHistoricalPrices(symbol, timeframe = '1mo') {
  if (!API_KEY) throw new ProviderError('Eulerpool API key not configured', 'eulerpool');

  try {
    const res = await fetch(`${BASE_URL}/prices/${symbol}?timeframe=${timeframe}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new ProviderError(`Eulerpool price data error: ${res.status}`, 'eulerpool');
    return await res.json();
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    throw new ProviderError('Eulerpool price data failed', 'eulerpool', err);
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

export default { getFinancialData, getHistoricalPrices, testConnection, name: 'eulerpool' };
