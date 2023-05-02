import { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams } from '..';

type BaseUser = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseUser &
  BaseCrmModelNonRemoteParams & {
    rawData?: Record<string, any>;
  };

export type RemoteUser = BaseUser &
  BaseCrmModelRemoteOnlyParams & {
    rawData: Record<string, any>;
  };
