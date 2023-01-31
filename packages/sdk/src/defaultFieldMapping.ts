type Mapping = {
  name: string;
  field: string;
};

export function defaultFieldMapping(fieldMapping: Mapping[], type: 'salesforce') {
  return new DefaultFieldMapping(fieldMapping, type);
}

export class DefaultFieldMapping {
  type: 'salesforce';
  fieldMapping: Mapping[];
  constructor(fieldMapping: Mapping[], type: 'salesforce') {
    this.fieldMapping = fieldMapping;
    this.type = type;
  }

  toJSON() {
    return this.fieldMapping;
  }
}
