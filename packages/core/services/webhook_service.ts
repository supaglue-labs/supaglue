import type { PrismaClient } from '@supaglue/db';
import { Application } from '@supaglue/types';
import { Svix } from 'svix';

const svix = new Svix(process.env.SVIX_API_TOKEN!, { serverUrl: process.env.SVIX_SERVER_URL });

export class WebhookService {
  #prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.#prisma = prisma;
  }

  async createApplication(applicationId: string, name: string) {
    return await svix.application.create({ uid: applicationId, name });
  }

  async sendMessage(eventType: string, payload: any, application: Application, idempotencyKey?: string) {
    return await svix.message.create(
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
