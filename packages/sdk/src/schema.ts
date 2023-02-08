type Field = {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
};

export type Schema = {
  fields: Field[];
};

export function schema(params: Schema): Schema {
  return params;
}
