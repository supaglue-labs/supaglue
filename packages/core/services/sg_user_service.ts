import { NotFoundError } from '../errors';
import { ADMIN_PASSWORD, SG_USER_ID } from '../lib/constants';
import { SgUser } from '../types/index';

export class SgUserService {
  public async login({ username, password }: { username: string; password: string }): Promise<SgUser | null> {
    if (username !== 'admin') {
      throw new NotFoundError(`Can't find sg user with username: ${username}`);
    }

    if (password !== ADMIN_PASSWORD) {
      return null;
    }

    return {
      id: SG_USER_ID,
      username: 'admin',
      password: ADMIN_PASSWORD,
      authType: 'username/password',
    };
  }
}
