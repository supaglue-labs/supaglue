import type { PrismaClient } from '@supaglue/db';
import { Application } from '@supaglue/types';

// TODO: bring back svix if necessary
// const svix = new Svix(process.env.SVIX_API_TOKEN!, { serverUrl: process.env.SVIX_SERVER_URL });

/**
 * WebhookService is a wrapper around Svix's API and is only used for CDC webhooks currently.
 */
export class WebhookService {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async createApplication(applicationId: string, name: string) {
    // TODO: bring back svix if necessary
    return;
    // return await svix.application.create({ uid: applicationId, name });
  }

  async sendMessage(eventType: string, payload: any, application: Application, idempotencyKey?: string) {
    // TODO: bring back svix if necessary
    return;
    // return await svix.message.create(
    //   application.id,
    //   { eventType, payload, application: { name: application.name, uid: application.id } },
    //   { idempotencyKey }
    // );
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
