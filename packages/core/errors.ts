type ErrorOrigin = 'supaglue' | 'remote-provider';
type ErrorParams = { detail: string; status: number; code: string; origin?: ErrorOrigin; cause?: any };

export class SGError extends Error {
  status: number;
  code: string;
  detail: string;
  meta: { origin: ErrorOrigin; cause?: any };
  httpCode = 500;
  constructor(message: string, { detail, status, code, origin, cause }: ErrorParams) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.meta = { origin: origin ?? 'supaglue', cause };
    this.cause = cause;
  }
}

export class HTTPError extends SGError {
  constructor(message: string, { detail, status, code, origin, cause }: Partial<ErrorParams>) {
    status = status ?? 500;
    code = code ?? 'INTERNAL_SERVER_ERROR';
    super(message, { detail: detail ?? message, status, code, origin, cause });
  }
}

export class InternalServerError extends HTTPError {
  constructor(message?: string, { detail, status, code, origin, cause }: Partial<ErrorParams> = {}) {
    super(message ?? 'Internal server error', {
      detail,
      status: status ?? 500,
      code: code ?? 'INTERNAL_SERVER_ERROR',
      origin,
      cause,
    });
  }
}

export class CacheInvalidationError extends InternalServerError {
  constructor(message?: string, { detail, status, origin, cause }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Cache invalidation error', { detail, status, code: 'CACHE_INVALIDATION_ERROR', origin, cause });
  }
}

export class NotImplementedError extends HTTPError {
  httpCode = 501;
  constructor(message?: string, { detail, status, cause }: Omit<Partial<ErrorParams>, 'code' | 'origin'> = {}) {
    super(message ?? 'Not implemented', {
      detail,
      status: status ?? 501,
      code: 'NOT_IMPLEMENTED_ERROR',
      cause,
    });
  }
}

export class BadGatewayError extends HTTPError {
  httpCode = 502;
  constructor(message?: string, { detail, status, cause }: Omit<Partial<ErrorParams>, 'code' | 'origin'> = {}) {
    super(message ?? 'Bad gateway', {
      detail,
      status: status ?? 502,
      code: 'BAD_GATEWAY_ERROR',
      origin: 'remote-provider',
      cause,
    });
  }
}

export class GatewayTimeoutError extends HTTPError {
  httpCode = 504;
  constructor(message?: string, { detail, status, cause }: Omit<Partial<ErrorParams>, 'code' | 'origin'> = {}) {
    super(message ?? 'Gateway timeout', {
      detail,
      status: status ?? 504,
      code: 'GATEWAY_TIMEOUT_ERROR',
      origin: 'remote-provider',
      cause,
    });
  }
}

export class ServiceUnavailableError extends HTTPError {
  httpCode = 503;
  constructor(message?: string, { detail, status, cause }: Omit<Partial<ErrorParams>, 'code' | 'origin'> = {}) {
    super(message ?? 'Service unavailable', {
      detail,
      status: status ?? 503,
      code: 'SERVICE_UNAVAILABLE_ERROR',
      origin: 'remote-provider',
      cause,
    });
  }
}

export class NotFoundError extends HTTPError {
  httpCode = 404;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Not found', { detail, status: status ?? 404, code: 'NOT_FOUND_ERROR', origin, cause });
  }
}

export class BadRequestError extends HTTPError {
  httpCode = 400;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Bad request', { detail, status: status ?? 400, code: 'BAD_REQUEST', origin, cause });
  }
}

export class UnauthorizedError extends HTTPError {
  httpCode = 401;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Unauthorized', { detail, status: status ?? 401, code: 'UNAUTHORIZED_ERROR', origin, cause });
  }
}

export class PaymentRequiredError extends HTTPError {
  httpCode = 402;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Payment required', {
      detail,
      status: status ?? 402,
      code: 'PAYMENT_REQUIRED_ERROR',
      origin,
      cause,
    });
  }
}

export class ForbiddenError extends HTTPError {
  httpCode = 403;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Forbidden', { detail, status: status ?? 403, code: 'FORBIDDEN_ERROR', origin, cause });
  }
}

export class ConflictError extends HTTPError {
  httpCode = 409;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Conflict', { detail, status: status ?? 409, code: 'CONFLICT_ERROR', origin, cause });
  }
}

export class UnprocessableEntityError extends HTTPError {
  httpCode = 422;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Unprocessable entity', {
      detail,
      status: status ?? 422,
      code: 'UNPROCESSABLE_ENTITY_ERROR',
      origin,
      cause,
    });
  }
}

export class RemoteProviderError extends HTTPError {
  httpCode = 499;
  constructor(message?: string, { detail, status, cause }: Omit<Partial<ErrorParams>, 'code' | 'origin'> = {}) {
    super(message ?? 'Remote provider error', {
      detail,
      status: status ?? 499,
      code: 'REMOTE_PROVIDER_ERROR',
      origin: 'remote-provider',
      cause,
    });
  }
}

export class TooManyRequestsError extends HTTPError {
  httpCode = 429;
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Too many requests', {
      detail,
      status: status ?? 429,
      code: 'TOO_MANY_REQUESTS_ERROR',
      origin,
      cause,
    });
  }
}

export class NotModifiedError extends HTTPError {
  constructor(message?: string, { detail, status, cause, origin }: Omit<Partial<ErrorParams>, 'code'> = {}) {
    super(message ?? 'Not modified', { detail, status: status ?? 304, code: 'NOT_MODIFIED_ERROR', origin, cause });
  }
}

//
// Internal errors
//

export class SGSyncWorkerError extends SGError {
  constructor(message: string, status?: number, code?: string, cause?: Error) {
    super(message, {
      detail: message,
      status: status ?? 500,
      code: code ?? 'SG_SYNC_WORKER_ERROR',
      origin: 'supaglue',
      cause,
    });
  }
}

// Throw this when you want run_object_sync to throw a non retryable temporal error
export class SGTerminalTooManyRequestsError extends SGSyncWorkerError {
  constructor(message: string, status?: number, cause?: Error) {
    super(message, status, 'SG_TERMINAL_TOO_MANY_REQUESTS_ERROR', cause);
  }
}

// Throw this when you want run_object_sync to pause after the current execution
export class SGConnectionNoLongerAuthenticatedError extends SGSyncWorkerError {
  constructor(message: string, status?: number, cause?: Error) {
    super(message, status ?? 401, 'SG_CONNECTION_NO_LONGER_AUTHENTICATED_ERROR', cause);
  }
}
