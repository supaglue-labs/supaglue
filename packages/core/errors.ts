class SGError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
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
