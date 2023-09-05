export type SubmitFormData = {
  email: string;
} & Record<string, unknown>;

export type SubmitFormResult = {
  id?: string;
  status: 'created' | 'updated' | 'skipped';
};
