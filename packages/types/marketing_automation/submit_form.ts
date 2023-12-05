export type SubmitFormData = {
  [key: string]: unknown;
};

export type SubmitFormResult = {
  id?: string;
  status: 'created' | 'updated' | 'skipped';
};
