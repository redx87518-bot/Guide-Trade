import { createPlan } from './planner.js';
import { researchCompany, getMarketData, getFinancials, searchNews } from '../tools/researchCompany.js';
import { analyzeResearch } from '../tools/analyzeResearch.js';
import { generateVoiceSummary } from '../tools/generateVoice.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export async function runResearch({ userId, query, symbol, companyName, depth = 2 }) {
  logger.info('Orchestrator: starting research', { userId, query });

  const plan = await createPlan({ query, symbol, companyName });
  logger.info('Orchestrator: plan created', { symbol: plan.symbol, steps: plan.steps.length });

  const providerResults = await researchCompany({
    symbol: plan.symbol,
    companyName: plan.companyName,
    depth: plan.depth,
  });

  const analysisResult = await analyzeResearch({
    symbol: plan.symbol,
    companyName: plan.companyName,
    providerResults,
  });

  const structuredReport = buildStructuredReport(plan.symbol, plan.companyName, analysisResult, providerResults);

  return {
    report: structuredReport,
    plan,
    providerAvailability: analysisResult.providerAvailability,
    errors: analysisResult.errors,
  };
}

export async function generateVoiceForUser({ userId, text, apiKey, voiceId }) {
  if (!apiKey || !voiceId) {
    throw new AppError('Voice credentials not configured', 400, 'missing_credentials');
  }
  return await generateVoiceSummary({ userId, text, apiKey, voiceId });
}

function buildStructuredReport(symbol, companyName, analysisResult, providerResults) {
  const report = {
    symbol,
    companyName,
    title: `${symbol || companyName} — Research`,
    summary: '',
    marketSnapshot: null,
    whatIsHappening: '',
    newsCatalysts: '',
    fundamentals: null,
    technicalContext: null,
    bullishFactors: [],
    bearishFactors: [],
    risks: [],
    outlook: '',
    confidence: analysisResult.confidence,
    sources: [],
    providerAvailability: analysisResult.providerAvailability,
    errors: providerResults.errors.map(e => ({ provider: e.provider, message: e.error })),
    disclaimer: 'Guide Trade provides research and educational information, not guaranteed financial predictions or personalized financial advice.',
  };

  const analysis = analysisResult.analysis;
  if (typeof analysis === 'string') {
    try {
      const parsed = JSON.parse(analysis);
      Object.assign(report, parsed);
    } catch {
      report.summary = analysis;
      report.outlook = 'See summary for full analysis.';
    }
  } else if (analysis && typeof analysis === 'object') {
    for (const [key, value] of Object.entries(analysis)) {
      if (key in report) report[key] = value;
    }
  }

  const sources = extractSources(providerResults);
  report.sources = sources;

  return report;
}

function extractSources(providerResults) {
  const sources = [];
  const addSource = (provider, items) => {
    if (!items || typeof items !== 'object') return;
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (item?.url || item?.sourceUrl) {
          sources.push({
            provider,
            sourceTitle: item.title || item.sourceTitle || '',
            sourceUrl: item.url || item.sourceUrl || '',
            publishedAt: item.publishedAt || item.published_at || null,
            retrievedAt: new Date().toISOString(),
            excerpt: item.excerpt || item.snippet || '',
          });
        }
      });
    } else if (items.results) {
      addSource(provider, items.results);
    } else if (items.data) {
      addSource(provider, items.data);
    }
  };

  if (providerResults.parallel) addSource('parallel', providerResults.parallel.results || providerResults.parallel);
  if (providerResults.eulerpool) addSource('eulerpool', providerResults.eulerpool);

  return sources;
}

export default { runResearch, generateVoiceForUser };
