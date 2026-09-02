export function validateString(value, { name, maxLength = 10000, required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`${name || 'Value'} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new Error(`${name || 'Value'} must be a string`);
  if (value.length > maxLength) throw new Error(`${name || 'Value'} exceeds max length ${maxLength}`);
  return value.trim();
}

export function validateSymbol(symbol) {
  const cleaned = validateString(symbol, { name: 'symbol', maxLength: 20, required: true });
  const valid = /^[A-Z0-9\-.]{1,20}$/i.test(cleaned);
  if (!valid) throw new Error('Invalid symbol format');
  return cleaned.toUpperCase();
}

export function validateDepth(depth) {
  const num = parseInt(depth || 1);
  if (num < 1) throw new Error('Depth must be at least 1');
  if (num > 5) throw new Error('Depth must be at most 5');
  return num;
}

export function validateEmail(email) {
  const cleaned = validateString(email, { name: 'email', maxLength: 255, required: true });
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(cleaned)) throw new Error('Invalid email format');
  return cleaned;
}

export function validateUserId(userId) {
  return validateString(userId, { name: 'userId', maxLength: 36, required: true });
}

export function sanitizeForLog(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  const sensitiveKeys = ['key', 'secret', 'token', 'password', 'apiKey', 'webhook'];
  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
      sanitized[k] = '[REDACTED]';
    }
  }
  return sanitized;
}
