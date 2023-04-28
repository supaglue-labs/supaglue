import { addLogContext } from '@supaglue/core/lib';
import { Context } from '@temporalio/activity';
import { defaultPayloadConverter } from '@temporalio/client';
import { ActivityExecuteInput, ActivityInboundCallsInterceptor, Next } from '@temporalio/worker/lib/interceptors';
import als from 'async-local-storage';

export default class ActivityLogInterceptor implements ActivityInboundCallsInterceptor {
  ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  async execute(input: ActivityExecuteInput, next: Next<ActivityInboundCallsInterceptor, 'execute'>) {
    als.scope();

    for (const [key, value] of Object.entries(input.headers)) {
      if (key.startsWith('sg-')) {
        const decodedValue = defaultPayloadConverter.fromPayload(value);
        addLogContext(key.substring(3), decodedValue);
      }
    }

    return await next(input);
  }
}
