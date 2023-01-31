export class UserFacingError extends Error {
  errors: any[];
  constructor(message: string, errors?: any[]) {
    super(message);
    this.errors = errors ?? [];
  }
}

export class NotImplementedError extends UserFacingError {
  constructor() {
    super('Not implemented');
  }
}
