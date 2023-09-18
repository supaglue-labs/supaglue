export type SubmitFormData = {
  email: string;
  [key: string]: unknown;
};

export type SubmitFormResult = {
  id?: string;
  status: 'created' | 'updated' | 'skipped';
};
