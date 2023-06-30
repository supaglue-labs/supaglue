import { TEMPORAL_CONTEXT_ARGS } from '@supaglue/core/temporal';
import type { Headers, Next } from '@temporalio/client';
import {
  ActivityInput,
  defaultPayloadConverter,
  WorkflowExecuteInput,
  WorkflowInboundCallsInterceptor,
  WorkflowInterceptors,
  WorkflowOutboundCallsInterceptor,
} from '@temporalio/workflow';

export function interceptors(): WorkflowInterceptors {
  const interceptor = new WorkflowLogInterceptor();
  return { outbound: [interceptor], inbound: [interceptor] };
}

class WorkflowLogInterceptor implements WorkflowOutboundCallsInterceptor, WorkflowInboundCallsInterceptor {
  contextHeaders: Headers = {};

  async execute(input: WorkflowExecuteInput, next: Next<WorkflowInboundCallsInterceptor, 'execute'>): Promise<unknown> {
    const contextArgs = (((input.args[0] ?? {}) as Record<string, unknown>).context ?? {}) as Record<string, unknown>;

    Object.entries(TEMPORAL_CONTEXT_ARGS).forEach(([_, value]) => {
      const contextKey = `sg-${value}`;
      if (contextArgs[value]) {
        this.contextHeaders[contextKey] = defaultPayloadConverter.toPayload(contextArgs[value]);
      }
    });

    return await next(input);
  }

  async scheduleActivity(
    input: ActivityInput,
    next: Next<WorkflowOutboundCallsInterceptor, 'scheduleActivity'>
  ): Promise<unknown> {
    for (const [key, value] of Object.entries(this.contextHeaders)) {
      input.headers[key] = value;
    }

    return await next(input);
  }
}
