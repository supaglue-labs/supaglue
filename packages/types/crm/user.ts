import { BaseCrmModel } from '..';

export type User = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};
