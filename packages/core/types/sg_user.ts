type BaseSgUser = {
  username: string;
  password: string;
  applicationId: string;
  authType: string;
};

export type SgUser = BaseSgUser & {
  id: string;
};
