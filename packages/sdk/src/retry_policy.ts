type RetryPolicyParams = {
  // TODO: Allow more customization
  retries?: number;
};

export function retryPolicy(params: RetryPolicyParams) {
  return new RetryPolicy(params);
}

export class RetryPolicy {
  retries?: number;

  constructor({ retries }: RetryPolicyParams) {
    this.retries = retries;
  }

  toJSON() {
    return {
      retries: this.retries,
    };
  }
}
