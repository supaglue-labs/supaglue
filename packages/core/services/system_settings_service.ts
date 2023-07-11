import type { PrismaClient } from '@supaglue/db';
import type { SystemSettings } from '@supaglue/types/system_settings';

const systemSettingsId = '1';

export class SystemSettingsService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  async #createSystemSettingsIfNotExist(): Promise<void> {
    const settings = await this.#prisma.systemSettings.findUnique({ where: { id: systemSettingsId } });
    if (!settings) {
      await this.#prisma.systemSettings.create({ data: { id: systemSettingsId } });
    }
  }

  public async getSystemSettings(): Promise<SystemSettings> {
    await this.#createSystemSettingsIfNotExist();
    const settings = await this.#prisma.systemSettings.findUniqueOrThrow({ where: { id: systemSettingsId } });
    return {
      processSyncChangesFull: !!settings.processSyncChangesFull,
    };
  }

  public async setProcessSyncChangesFull(full: boolean): Promise<void> {
    await this.#createSystemSettingsIfNotExist();
    await this.#prisma.systemSettings.update({
      where: { id: systemSettingsId },
      data: { processSyncChangesFull: full },
    });
  }
}
