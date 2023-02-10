import { RetryPolicy as RetryPolicyParams } from '@supaglue/types';

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
