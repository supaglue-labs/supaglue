class SGError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotImplementedError extends SGError {
  constructor(message?: string) {
    super(message || 'Not implemented');
  }
}

export class HTTPError extends SGError {
  code = 500;
  problemType = 'INTERNAL_SERVER_ERROR';
  cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;
  }
}

export class InternalServerError extends HTTPError {
  code = 500;
  problemType = 'INTERNAL_SERVER_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class BadGatewayError extends HTTPError {
  code = 502;
  problemType = 'BAD_GATEWAY_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ServiceUnavailableError extends HTTPError {
  code = 503;
  problemType = 'SERVICE_UNAVAILABLE_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class NotFoundError extends HTTPError {
  code = 404;
  problemType = 'NOT_FOUND_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class BadRequestError extends HTTPError {
  code = 400;
  problemType = 'BAD_REQUEST_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class UnauthorizedError extends HTTPError {
  code = 401;
  problemType = 'UNAUTHORIZED_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ForbiddenError extends HTTPError {
  code = 403;
  problemType = 'FORBIDDEN_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConflictError extends HTTPError {
  code = 409;
  problemType = 'CONFLICT_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class UnprocessableEntityError extends HTTPError {
  code = 422;
  problemType = 'UNPROCESSABLE_ENTITY_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class TooManyRequestsError extends HTTPError {
  code = 429;
  problemType = 'TOO_MANY_REQUESTS_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class NotModifiedError extends HTTPError {
  code = 304;
  problemType = 'NOT_MODIFIED';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}
