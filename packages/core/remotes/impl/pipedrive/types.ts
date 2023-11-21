export type BasePipedriveObjectField = {
  key: string;
  name: string;
  edit_flag: boolean; // if true, it's a custom field
  // if true, it's a required field
  // if object, it's a required field if the field specified by each key matches the expression in the value
  mandatory_flag?:
    | boolean
    | {
        [field: string]: string;
      };
};

export type NormalPipedriveObjectField = BasePipedriveObjectField & {
  field_type:
    | 'address'
    | 'date'
    | 'daterange'
    | 'double'
    | 'int'
    | 'monetary'
    | 'org'
    | 'people'
    | 'phone'
    | 'text'
    | 'time'
    | 'timerange'
    | 'user'
    | 'varchar'
    | 'varchar_auto'
    | 'varchar_options'
    | 'visible_to';
};

export type EnumOrSetPipedriveObjectField = BasePipedriveObjectField & {
  field_type: 'enum' | 'set';
  options: {
    id: number | string;
    label: string;
  }[];
};

export type PipedriveObjectField = NormalPipedriveObjectField | EnumOrSetPipedriveObjectField;
