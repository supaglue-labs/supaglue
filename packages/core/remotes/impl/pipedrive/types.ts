export type BasePipedriveObjectField = {
  key: string;
  name: string;
  edit_flag: boolean; // if true, it's a custom field
};

export type NormalPipedriveObjectField = BasePipedriveObjectField & {
  field_type:
    | 'address'
    | 'date'
    | 'daterange'
    | 'double'
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
    | 'visible_to';
};

export type EnumOrSetPipedriveObjectField = BasePipedriveObjectField & {
  field_type: 'enum' | 'set';
  options: {
    id: number;
    label: string;
  }[];
};

export type PipedriveObjectField = NormalPipedriveObjectField | EnumOrSetPipedriveObjectField;
