const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const COLORS = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', debug: '\x1b[90m' };
const RESET = '\x1b[0m';

let currentLevel = LEVELS.info;

export function setLogLevel(level) {
  if (typeof level === 'string') level = LEVELS[level] ?? LEVELS.info;
  currentLevel = level;
}

function log(level, message, context = {}) {
  if (LEVELS[level] > currentLevel) return;
  const timestamp = new Date().toISOString();
  const color = COLORS[level] || '';
  const ctxStr = Object.keys(context).length > 0 ? ' ' + JSON.stringify(context) : '';
  const safeContext = {};
  for (const [k, v] of Object.entries(context)) {
    if (k.toLowerCase().includes('key') || k.toLowerCase().includes('token') || k.toLowerCase().includes('secret')) {
      safeContext[k] = '[REDACTED]';
    } else {
      safeContext[k] = v;
    }
  }
  const safeCtxStr = Object.keys(safeContext).length > 0 ? ' ' + JSON.stringify(safeContext) : '';
  console.log(`${color}[${timestamp}] ${level.toUpperCase()}${RESET}${safeCtxStr} ${message}`);
}

export function logger() {
  return {
    error: (msg, ctx) => log('error', msg, ctx),
    warn: (msg, ctx) => log('warn', msg, ctx),
    info: (msg, ctx) => log('info', msg, ctx),
    debug: (msg, ctx) => log('debug', msg, ctx),
  };
}

export default logger();
