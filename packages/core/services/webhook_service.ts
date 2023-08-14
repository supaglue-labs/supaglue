import type { PrismaClient } from '@supaglue/db';
import type { WebhookPayloads, WebhookType } from '@supaglue/schemas/v2/mgmt';
import { Svix } from 'svix';
import type { ApplicationService } from './application_service';

/**
 * WebhookService is a wrapper around Svix's API.
 */
export class WebhookService {
  #prisma: PrismaClient;
  #svix: Svix | undefined;
  #applicationService: ApplicationService;

  constructor({ prisma, applicationService }: { prisma: PrismaClient; applicationService: ApplicationService }) {
    this.#prisma = prisma;
    this.#applicationService = applicationService;
    if (process.env.SVIX_API_TOKEN) {
      this.#svix = new Svix(process.env.SVIX_API_TOKEN, { serverUrl: process.env.SVIX_SERVER_URL });
    }
  }

  async createApplication(applicationId: string, name: string) {
    if (!this.#svix) {
      return;
    }
    return await this.#svix.application.create({ uid: applicationId, name });
  }

  async sendMessage<T extends WebhookType>(
    eventType: T,
    payload: WebhookPayloads[T],
    applicationId: string,
    idempotencyKey?: string
  ) {
    if (!this.#svix) {
      return;
    }
    const application = await this.#applicationService.getById(applicationId);
    return await this.#svix.message.create(
      application.id,
      { eventType, payload, application: { name: application.name, uid: application.id } },
      { idempotencyKey }
    );
  }

  async saveReplayId(connectionId: string, eventType: string, replayId: string) {
    return await this.#prisma.replayId.upsert({
      where: { connectionId_eventType: { connectionId, eventType } },
      create: { connectionId, eventType, replayId },
      update: { replayId },
    });
  }

  async getReplayId(connectionId: string, eventType: string) {
    const replayId = await this.#prisma.replayId.findUnique({
      where: { connectionId_eventType: { connectionId, eventType } },
    });
    return replayId?.replayId;
  }
}
