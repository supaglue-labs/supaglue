import { PrismaClient } from '@supaglue/db';
import { Pool } from 'pg';
import { RemoteService } from '../remote_service';

export abstract class CommonModelBaseService {
  // TODO: Use just pg for common models?
  protected readonly pgPool: Pool;
  protected readonly prisma: PrismaClient;
  protected readonly remoteService: RemoteService;

  // setting constructor as public so that we can use `ConstructorParameters` in child classes
  public constructor(pgPool: Pool, prisma: PrismaClient, remoteService: RemoteService) {
    this.pgPool = pgPool;
    this.prisma = prisma;
    this.remoteService = remoteService;
  }
}
