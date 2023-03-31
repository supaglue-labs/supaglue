type BaseSgUser = {
  username: string;
  password: string;
  authType: string;
};

export type SgUser = BaseSgUser & {
  id: string;
};
