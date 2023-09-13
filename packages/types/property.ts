export type Property = {
  id: string;
  label: string;

  // this is passed back directly from the provider
  // we do not have our own enum mapping here
  type?: string;
};
