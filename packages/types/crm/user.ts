import { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams } from '..';

type BaseUser = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseUser & BaseCrmModelNonRemoteParams;

export type RemoteUser = BaseUser &
  BaseCrmModelRemoteOnlyParams & {
    rawData: Record<string, any>;
  };
