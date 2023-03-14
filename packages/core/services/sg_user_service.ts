import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { fromSgUserModel } from '../mappers/index';
import { SgUser } from '../types/index';

export class SgUserService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async login({
    applicationId,
    username,
    password,
  }: {
    applicationId: string;
    username: string;
    password: string;
  }): Promise<SgUser | null> {
    const sgUserModel = await this.#prisma.sgUser.findUnique({
      where: {
        applicationId_username: {
          applicationId,
          username,
        },
      },
    });

    if (!sgUserModel) {
      throw new NotFoundError(`Can't find sg user with username: ${username}`);
    }

    const sgUser = fromSgUserModel(sgUserModel);

    // TODO: check against hashed password
    if (password !== sgUser.password) {
      return null;
    }

    return sgUser;
  }
}
