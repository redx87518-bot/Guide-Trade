export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'general_error', details = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ProviderError extends AppError {
  constructor(message, provider, cause = null) {
    super(message, 502, 'provider_error', { provider });
    this.name = 'ProviderError';
    this.provider = provider;
    this.originalError = cause;
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'validation_error', { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'unauthorized');
    this.name = 'AuthenticationError';
  }
}

export function handleError(error) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }
  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'internal_error',
      statusCode: 500,
    };
  }
  return {
    error: 'Unknown error',
    code: 'unknown_error',
    statusCode: 500,
  };
}

export function createErrorResponse(error, reqId = null) {
  const handled = handleError(error);
  return {
    status: handled.statusCode,
    json: {
      error: handled.error,
      code: handled.code,
      ...(reqId ? { requestId: reqId } : {}),
      ...(handled.details ? { details: handled.details } : {}),
    },
  };
}
