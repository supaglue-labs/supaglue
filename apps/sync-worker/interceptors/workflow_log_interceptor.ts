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

    const syncId = contextArgs[TEMPORAL_CONTEXT_ARGS.SYNC_ID];
    if (syncId) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.SYNC_ID}`] = defaultPayloadConverter.toPayload(syncId);
    }

    const applicationId = contextArgs[TEMPORAL_CONTEXT_ARGS.APPLICATION_ID];
    if (applicationId) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.APPLICATION_ID}`] =
        defaultPayloadConverter.toPayload(applicationId);
    }

    const customerId = contextArgs[TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID];
    if (customerId) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID}`] = defaultPayloadConverter.toPayload(customerId);
    }

    const connectionId = contextArgs[TEMPORAL_CONTEXT_ARGS.CONNECTION_ID];
    if (connectionId) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.CONNECTION_ID}`] =
        defaultPayloadConverter.toPayload(connectionId);
    }

    const providerCategory = contextArgs[TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY];
    if (providerCategory) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY}`] =
        defaultPayloadConverter.toPayload(providerCategory);
    }

    const providerName = contextArgs[TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME];
    if (providerName) {
      this.contextHeaders[`sg-${TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME}`] =
        defaultPayloadConverter.toPayload(providerName);
    }

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
