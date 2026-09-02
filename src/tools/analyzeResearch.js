import quanProvider from '../providers/quan.js';
import eulerpoolProvider from '../providers/eulerpool.js';
import parallelProvider from '../providers/parallel.js';
import { logger } from '../utils/logger.js';

export async function analyzeResearch({ symbol, companyName, providerResults }) {
  logger.info('Starting analysis synthesis', { symbol });

  const hasQuan = providerResults.quanAvailable && providerResults.quan;
  const hasBeyalan = providerResults.beyalanAvailable && providerResults.beyalan;
  const hasParallel = providerResults.parallelAvailable && providerResults.parallel;
  const hasEulerpool = providerResults.eulerpoolAvailable && providerResults.eulerpool;

  const synthesisPrompt = buildSynthesisPrompt(symbol, companyName, providerResults, {
    hasQuan, hasBeyalan, hasParallel, hasEulerpool,
  });

  let analysis = null;
  let usedProvider = null;
  let confidence = 'low';

  // Primary: Quan (finance-focused AI reasoning)
  if (hasQuan) {
    try {
      analysis = await quanProvider.queryQuan(synthesisPrompt, {
        maxTokens: 3000,
        temperature: 0.3,
        reasoning: true,
      });
      usedProvider = 'quan';
      confidence = hasBeyalan ? 'high' : 'medium';
    } catch (err) {
      logger.warn('Quan analysis failed', { error: err.message });
    }
  }

  // Fallback: Beyalan
  if (!analysis && hasBeyalan) {
    try {
      analysis = await beyalanProvider.queryBeyalan(synthesisPrompt, { depth: 2 });
      usedProvider = 'beyalan';
      confidence = hasParallel ? 'medium' : 'low';
    } catch (err) {
      logger.warn('Beyalan analysis failed', { error: err.message });
    }
  }

  if (!analysis) {
    analysis = {
      summary: 'Unable to generate full analysis due to provider limitations.',
      outlook: 'Limited data available for analysis.',
      confidence: 'low',
      limitations: providerResults.errors,
    };
    usedProvider = null;
    confidence = 'low';
  }

  return {
    analysis,
    usedProvider,
    confidence,
    providerAvailability: {
      quan: hasQuan,
      beyalan: hasBeyalan,
      parallel: hasParallel,
      eulerpool: hasEulerpool,
    },
    errors: providerResults.errors,
  };
}

function buildSynthesisPrompt(symbol, companyName, results, availability) {
  const parts = [`# Financial Research Analysis: ${companyName || symbol} (${symbol})`];

  if (availability.hasQuan && results.quan) {
    parts.push(`\n## Quan Financial Reasoning:\n${extractText(results.quan)}`);
  }
  if (availability.hasBeyalan && results.beyalan) {
    parts.push(`\n## Beyalan Quantitative Analysis:\n${extractText(results.beyalan)}`);
  }
  if (availability.hasEulerpool && results.eulerpool) {
    parts.push(`\n## Eulerpool Financial Data:\n${extractText(results.eulerpool)}`);
  }
  if (availability.hasParallel && results.parallel) {
    parts.push(`\n## Parallel Web Research:\n${extractText(results.parallel)}`);
  }

  parts.push(`
## Instructions:
Synthesize the above information into a structured financial research report. Include:
1. Market snapshot and current movement
2. Plain-language "what is happening" explanation
3. News and catalysts with sources
4. Fundamentals (revenue, earnings, growth, valuation)
5. Technical/market context (if available)
6. Bullish factors (evidence-based)
7. Bearish factors (evidence-based)
8. Key risks
9. Research-based outlook (balanced, uncertain language)
10. Confidence level based on evidence quality and data availability

CRITICAL: Never fabricate data. Clearly label when information is unavailable or when a provider was offline. Use uncertain language like "based on available evidence" rather than guaranteed predictions. Include source references where provided.`);

  return parts.join('\n');
}

function extractText(data) {
  if (!data) return 'N/A';
  if (typeof data === 'string') return data;
  if (data.content) return typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
  if (data.text) return data.text;
  if (data.response) return typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
  return JSON.stringify(data).substring(0, 3000);
}
