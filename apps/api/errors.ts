class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HTTPError extends MyError {
  code = 500;
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends HTTPError {
  code = 404;
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends HTTPError {
  code = 400;
  constructor(message: string) {
    super(message);
  }
}
