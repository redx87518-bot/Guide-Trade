import { logger, setLogLevel } from './utils/logger.js';
import { handleError } from './utils/errors.js';
import { validateSymbol, validateDepth, validateString } from './utils/validation.js';
import { createPlan } from './agent/planner.js';
import { runResearch, generateVoiceForUser } from './agent/orchestrator.js';
import researchService from './services/researchService.js';
import userSettingsService from './services/userSettingsService.js';
import notificationService from './services/notificationService.js';
import reportService from './services/reportService.js';
import { createDocumentSafe, deleteDocument, listDocumentsUserScoped } from './appwrite/database.js';

const { COLLECTIONS, createResearchSession, updateSessionStatus, saveResearchResult, getUserResearchHistory, getUserWatchlists } = researchService;

setLogLevel(process.env.LOG_LEVEL || 'info');

export default async (req, res) => {
  const reqId = req.id || `req_${Date.now()}`;
  logger.info('Request received', { reqId, method: req.method, path: req.path });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const userId = extractUserId(req.headers);
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized: user ID required', reqId);
    }

    await ensureUserSettings(userId);

    const route = body.route || req.query?.route || req.path;
    logger.debug('Route dispatch', { reqId, route, userId });

    let result;
    switch (route) {
      case 'research':
      case '/research':
        result = await handleResearch(req, res, body, userId, reqId);
        return;
      case 'history':
      case '/history':
        result = await handleHistory(userId, reqId);
        return res.json(result, 200);
      case 'watchlist':
      case '/watchlist':
        result = await handleWatchlist(userId, body, reqId);
        return res.json(result, 200);
      case 'settings':
      case '/settings':
        result = await handleSettings(userId, body, reqId);
        return res.json(result, 200);
      case 'voice':
      case '/voice':
        return await handleVoice(userId, body, res, reqId);
      case 'report':
      case '/report':
        return await handleReport(userId, body, res, reqId);
      case 'test':
      case '/test':
        return res.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
      default:
        return errorResponse(res, 404, `Unknown route: ${route}`, reqId);
    }
  } catch (err) {
    logger.error('Request error', { reqId, error: err.message, stack: err.stack });
    const handled = handleError(err);
    return errorResponse(res, handled.statusCode, handled.error, reqId, handled.details);
  }
};

function extractUserId(headers) {
  const userIdHeader = headers['x-appwrite-user-id'];
  if (userIdHeader) return userIdHeader;
  
  const jwt = headers['x-appwrite-jwt'] || headers['authorization']?.replace('Bearer ', '');
  if (jwt) {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
      return payload.sub || payload.userId || payload.user_id;
    } catch {
      return null;
    }
  }
  return null;
}

async function ensureUserSettings(userId) {
  const settings = await userSettingsService.getUserSettings({ userId });
  if (!settings) {
    await userSettingsService.createDefaultSettings({ userId });
    logger.info('Default user settings created', { userId });
  }
}

async function handleResearch(req, res, body, userId, reqId) {
  const query = validateString(body.query, { name: 'query', maxLength: 500, required: true });
  const symbol = body.symbol ? validateSymbol(body.symbol) : null;
  const companyName = body.companyName || null;
  const depth = validateDepth(body.depth || 2);

  const session = await createResearchSession({ userId, query, symbol, status: 'planning' });
  logger.info('Research session created', { reqId, sessionId: session.$id });

  await updateSessionStatus({ userId, sessionId: session.$id, status: 'researching' });

  const { report, providerAvailability, errors } = await runResearch({
    userId, query, symbol, companyName, depth,
  });

  await updateSessionStatus({ userId, sessionId: session.$id, status: 'analyzing' });

  const result = await saveResearchResult({ userId, sessionId: session.$id, report });
  logger.info('Research result saved', { reqId, resultId: result.$id });

  await updateSessionStatus({ userId, sessionId: session.$id, status: 'completed', completedAt: new Date().toISOString() });

  if (body.notify !== false) {
    await notificationService.sendNotification({
      userId,
      type: 'research_completed',
      title: 'Research completed',
      message: `${report.symbol || report.companyName} market research is ready.`,
    });
  }

  return res.json({
    sessionId: session.$id,
    resultId: result.$id,
    report,
    providerAvailability,
    errors,
  }, 200);
}

async function handleHistory(userId, reqId) {
  const result = await getUserResearchHistory({ userId });
  return {
    results: result.documents.map(doc => ({
      id: doc.$id,
      symbol: doc.symbol,
      title: doc.title,
      summary: doc.summary,
      confidence: doc.confidence,
      createdAt: doc.createdAt,
    })),
  };
}

async function handleWatchlist(userId, body, reqId) {
  const action = body.action || 'list';

  switch (action) {
    case 'list':
      const watchlists = await getUserWatchlists({ userId });
      return { watchlists: watchlists.documents || [] };
    case 'add': {
      const { name, symbols } = body;
      const wl = await createDocumentSafe(userId, COLLECTIONS.watchlists, {
        userId,
        name: validateString(name, { maxLength: 255 }),
        symbols: Array.isArray(symbols) ? symbols : [validateSymbol(symbols)],
        createdAt: new Date().toISOString(),
      });
      return { watchlist: wl };
    }
    case 'remove': {
      const { watchlistId } = body;
      await deleteDocument(userId, COLLECTIONS.watchlists, watchlistId);
      return { deleted: true };
    }
    default:
      return { error: `Unknown watchlist action: ${action}` };
  }
}

async function handleSettings(userId, body, reqId) {
  const action = body.action || 'get';

  switch (action) {
    case 'get':
      const settings = await userSettingsService.getUserSettings({ userId });
      return settings || {};
    case 'update':
      const updated = await userSettingsService.updateSettings({ userId, settings: body.settings || {} });
      return updated;
    case 'test-voice': {
      const { apiKey, voiceId, text } = body;
      const audio = await generateVoiceForUser({ userId, text: text || 'Test voice for Guide Trade', apiKey, voiceId });
      return { audioBytes: audio ? audio.byteLength : 0 };
    }
    default:
      return { error: `Unknown settings action: ${action}` };
  }
}

async function handleVoice(userId, body, res, reqId) {
  const { apiKey, voiceId, text } = body;
  if (!apiKey || !voiceId) {
    return errorResponse(res, 400, 'ElevenLabs API key and Voice ID required', reqId);
  }
  const audio = await generateVoiceForUser({ userId, text, apiKey, voiceId });
  return res.json({ audioBytes: audio.byteLength, contentType: 'audio/mpeg' }, 200);
}

async function handleReport(userId, body, res, reqId) {
  const action = body.action || 'create';
  
  switch (action) {
    case 'create': {
      const { researchId, researchData } = body;
      const pdfBuffer = await reportService.createReportPdf({ userId, researchData: researchData });
      const file = await reportService.saveReport({ userId, researchId, title: researchData.title || `${researchData.symbol} Research Report`, fileBuffer: pdfBuffer });
      return res.json({ fileId: file.$id, fileName: file.name }, 200);
    }
    case 'get': {
      const { fileId } = body;
      const fileData = await reportService.getReportFile(userId, fileId);
      return res.json({ fileId, data: fileData }, 200);
    }
    default:
      return errorResponse(res, 400, `Unknown report action: ${action}`, reqId);
  }
}

function errorResponse(res, status, message, reqId, details = {}) {
  return res.json({
    error: message,
    code: 'error',
    requestId: reqId,
    ...details,
  }, status);
}
