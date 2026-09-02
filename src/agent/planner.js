import { validateString, validateSymbol, validateDepth } from '../utils/validation.js';

export async function createPlan({ query, symbol, companyName }) {
  const plan = {
    steps: [],
    providers: {},
    depth: 1,
    symbol: null,
    companyName: companyName || null,
    confidence: 'high',
  };

  if (symbol) {
    plan.symbol = validateSymbol(symbol);
  } else {
    const extracted = extractSymbol(query);
    if (extracted) plan.symbol = extracted;
  }

  if (!plan.symbol && !companyName) {
    plan.companyName = query.replace(/research\s*/i, '').trim();
  } else if (!plan.companyName) {
    plan.companyName = query.replace(/research\s*/i, '').trim();
  }

  plan.depth = Math.min(validateDepth(1), 2);

  plan.steps = [
    { id: 'create_session', name: 'Create research session', provider: 'internal' },
    { id: 'market_data', name: 'Gather market data', provider: 'eulerpool' },
    { id: 'financials', name: 'Gather financial data', provider: 'eulerpool' },
    { id: 'quant_analysis', name: 'Run quant analysis', provider: 'beyalan' },
    { id: 'web_research', name: 'Search recent news and evidence', provider: 'parallel' },
    { id: 'reasoning', name: 'Generate financial reasoning', provider: 'quan' },
    { id: 'synthesize', name: 'Synthesize research report', provider: 'agent' },
    { id: 'save_result', name: 'Save research result', provider: 'internal' },
  ];

  plan.providers = {
    eulerpool: { required: true, optional: false },
    beyalan: { required: true, optional: false },
    parallel: { required: true, optional: true },
    quan: { required: true, optional: true },
  };

  return plan;
}

function extractSymbol(query) {
  if (!query) return null;
  const upper = query.toUpperCase();
  const match = upper.match(/\b([A-Z]{1,5})\b/);
  if (match) return match[1];
  return null;
}

export default { createPlan };
