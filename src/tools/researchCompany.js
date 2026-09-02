import quanProvider from '../providers/quan.js';
import beyalanProvider from '../providers/beyalan.js';
import parallelProvider from '../providers/parallel.js';
import eulerpoolProvider from '../providers/eulerpool.js';
import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';

export async function researchCompany({ symbol, companyName, depth = 1 }) {
  logger.info('Starting company research', { symbol, companyName, depth });

  const query = `${companyName || symbol} (${symbol}) financial research. Analyze business model, market position, competitive advantages, revenue streams, growth prospects, and key financial metrics.`;
  const results = {
    quan: null,
    beyalan: null,
    eulerpool: null,
    parallel: null,
    errors: [],
  };

  // Parallel: web research (news, evidence, citations)
  try {
    const searchQuery = `${companyName || symbol} financial research news analysis recent developments`;
    const webRes = await parallelProvider.searchWeb(searchQuery, { maxResults: 10, timeoutMs: 25000 });
    results.parallel = webRes;
    results.parallelAvailable = true;
  } catch (err) {
    results.errors.push({ provider: 'parallel', error: err.message });
    results.parallelAvailable = false;
    logger.warn('Parallel unavailable for company research', { symbol, error: err.message });
  }

  // Eulerpool: financial data (fundamentals, history)
  try {
    const finRes = await eulerpoolProvider.getFinancialData(symbol, { datatype: 'fundamentals', timeoutMs: 25000 });
    results.eulerpool = finRes;
    results.eulerpoolAvailable = true;
  } catch (err) {
    results.errors.push({ provider: 'eulerpool', error: err.message });
    results.eulerpoolAvailable = false;
    logger.warn('Eulerpool unavailable', { symbol, error: err.message });
  }

  // Beyalan: quant analysis
  try {
    const quantRes = await beyalanProvider.queryBeyalan(query, { depth, timeoutMs: 25000 });
    results.beyalan = quantRes;
    results.beyalanAvailable = true;
  } catch (err) {
    results.errors.push({ provider: 'beyalan', error: err.message });
    results.beyalanAvailable = false;
    logger.warn('Beyalan unavailable', { symbol, error: err.message });
  }

  // Quan: financial reasoning
  try {
    const reasoning = `You are a financial research assistant. Research ${companyName || symbol} (${symbol}). Provide detailed analysis of: business model, market position, financial health, competitive advantages, risks, and investment outlook. Be evidence-based and cite sources where possible.`;
    const quanRes = await quanProvider.queryQuan(reasoning, {
      maxTokens: depth >= 3 ? 4096 : 2048,
      temperature: 0.5,
      timeoutMs: 30000,
    });
    results.quan = quanRes;
    results.quanAvailable = true;
  } catch (err) {
    results.errors.push({ provider: 'quan', error: err.message });
    results.quanAvailable = false;
    logger.warn('Quan unavailable, falling back to Beyalan', { symbol, error: err.message });
  }

  logger.info('Company research completed', { symbol, errors: results.errors.length });
  return results;
}

export async function getMarketData({ symbol, timeframe = '1mo' }) {
  logger.info('Fetching market data', { symbol, timeframe });
  try {
    const data = await eulerpoolProvider.getFinancialData(symbol, { datatype: 'market', timeoutMs: 20000 });
    const prices = await eulerpoolProvider.getHistoricalPrices(symbol, timeframe);
    return { data, prices, source: 'eulerpool' };
  } catch (err) {
    logger.warn('Market data via Eulerpool failed, trying Parallel', { symbol, error: err.message });
    try {
      const searchRes = await parallelProvider.searchWeb(`${symbol} stock price market data`, { maxResults: 5, timeoutMs: 20000 });
      return { data: searchRes, source: 'parallel' };
    } catch (fallbackErr) {
      return { data: null, error: fallbackErr.message, source: null };
    }
  }
}

export async function getFinancials({ symbol }) {
  logger.info('Fetching financials', { symbol });
  try {
    const data = await eulerpoolProvider.getFinancialData(symbol, { datatype: 'financials', timeoutMs: 20000 });
    return { data, source: 'eulerpool' };
  } catch (err) {
    logger.warn('Financials via Eulerpool failed', { symbol, error: err.message });
    try {
      const searchRes = await parallelProvider.searchWeb(`${symbol} financial statements revenue earnings`, { maxResults: 5, timeoutMs: 20000 });
      return { data: searchRes, source: 'parallel' };
    } catch (fallbackErr) {
      return { data: null, error: fallbackErr.message, source: null };
    }
  }
}

export async function searchNews({ query, days = 7 }) {
  logger.info('Searching news', { query, days });
  try {
    const data = await parallelProvider.searchWeb(`${query} financial news`, {
      maxResults: 15,
      recent: days <= 3 ? 'day' : days <= 7 ? 'week' : 'month',
      timeoutMs: 20000,
    });
    return { data, source: 'parallel' };
  } catch (err) {
    logger.warn('News search via Parallel failed', { error: err.message });
    try {
      const quanRes = await quanProvider.queryQuan(`Search for recent news about: ${query}. Summarize key developments.`);
      return { data: quanRes, source: 'quan' };
    } catch (fallbackErr) {
      return { data: null, error: fallbackErr.message, source: null };
    }
  }
}
