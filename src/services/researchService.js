import { createDocumentSafe, listDocumentsUserScoped, getDocument, updateDocument, deleteDocument } from '../appwrite/database.js';
import { logger } from '../utils/logger.js';

const COLLECTIONS = {
  profiles: 'profiles',
  watchlists: 'watchlists',
  researchSessions: 'research_sessions',
  researchResults: 'research_results',
  savedReports: 'saved_reports',
  userSettings: 'user_settings',
  notifications: 'notifications',
};

export async function createResearchSession({ userId, query, status = 'pending' }) {
  const doc = await createDocumentSafe(userId, COLLECTIONS.researchSessions, {
    userId,
    query,
    status,
    startedAt: new Date().toISOString(),
    completedAt: null,
  });
  logger.info('Research session created', { userId, sessionId: doc.$id });
  return doc;
}

export async function updateSessionStatus({ userId, sessionId, status, completedAt = null }) {
  const data = { status, ...(completedAt ? { completedAt } : {}) };
  return await updateDocument(userId, COLLECTIONS.researchSessions, sessionId, data);
}

export async function saveResearchResult({ userId, sessionId, report }) {
  const doc = await createDocumentSafe(userId, COLLECTIONS.researchResults, {
    userId,
    sessionId,
    symbol: report.symbol,
    title: report.title,
    summary: report.summary,
    bullishFactors: JSON.stringify(report.bullishFactors || []),
    bearishFactors: JSON.stringify(report.bearishFactors || []),
    risks: JSON.stringify(report.risks || []),
    outlook: report.outlook,
    confidence: report.confidence,
    sources: JSON.stringify(report.sources || []),
    createdAt: new Date().toISOString(),
  });
  logger.info('Research result saved', { userId, resultId: doc.$id });
  return doc;
}

export async function getUserResearchHistory({ userId, limit = 50, offset = 0 }) {
  const queries = [`limit=${limit}`, `offset=${offset}`, `orderDesc("createdAt")`];
  return await listDocumentsUserScoped(userId, COLLECTIONS.researchResults, queries);
}

export async function getUserWatchlists({ userId }) {
  return await listDocumentsUserScoped(userId, COLLECTIONS.watchlists);
}

export async function searchWatchlist({ userId, symbol }) {
  const queries = [`equal("userId", "${userId}")`, `equal("symbols", "${symbol}")`, 'limit=1'];
  const result = await listDocumentsUserScoped(userId, COLLECTIONS.watchlists, queries);
  return result.documents?.length > 0 ? result.documents[0] : null;
}

export default {
  COLLECTIONS,
  createResearchSession,
  updateSessionStatus,
  saveResearchResult,
  getUserResearchHistory,
  getUserWatchlists,
  searchWatchlist,
};
