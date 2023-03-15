import type { SgUser as SgUserModel } from '@supaglue/db';
import { SgUser } from '../types';

export const fromSgUserModel = ({ id, authType, username, password, applicationId }: SgUserModel): SgUser => {
  return {
    id,
    authType,
    username,
    password,
    applicationId,
  };
};
