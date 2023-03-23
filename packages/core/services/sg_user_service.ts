import { NotFoundError } from '../errors';
import { SgUser } from '../types/index';

const SG_USER_ID = 'd56b851b-5a36-4480-bc43-515d677f46e3';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';

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
