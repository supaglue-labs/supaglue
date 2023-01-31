type Field = {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
};

type SchemaParams = {
  fields: Field[];
};

export function schema(params: SchemaParams) {
  return new Schema(params);
}

export class Schema {
  fields: Field[];
  constructor({ fields }: SchemaParams) {
    this.fields = fields;
  }

  toJSON() {
    return {
      fields: this.fields,
    };
  }
}
