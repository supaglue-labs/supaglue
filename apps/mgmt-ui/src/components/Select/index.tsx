import type { ListSubheaderProps } from '@mui/material';
import { ListSubheader } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import type { ReactNode } from 'react';

function GroupHeader(props: ListSubheaderProps) {
  return <ListSubheader {...props} />;
}

GroupHeader.muiSkipListHighlight = true;

export type SelectOption = {
  value: string;
  displayValue?: string | ReactNode;
};

export type OptionGroup = {
  header: string;
  options: SelectOption[];
};

export type SelectProps = {
  name: string;
  value: string;
  options?: SelectOption[];
  groupedOptions?: OptionGroup[];
  isGrouped?: boolean;
  onChange?: (value: string) => void;
  // If set, will add a None option to unselect
  unselect?: boolean;
  disabled?: boolean;
};

export default function Select({
  name,
  value,
  options,
  groupedOptions,
  onChange,
  unselect,
  disabled,
  isGrouped,
}: SelectProps) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id={`select-${name}`}>{name}</InputLabel>
        <MuiSelect
          disabled={disabled}
          labelId={`select-${name}-label`}
          id={`select-${name}-id`}
          value={value}
          label={name}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        >
          {unselect && (
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          )}
          {!isGrouped &&
            options?.map((option, idx) => (
              <MenuItem key={idx} value={option.value}>
                {option.displayValue ?? option.value}
              </MenuItem>
            ))}
          {isGrouped &&
            // Note: we need to return an array instead of a fragment so MUI can properly render the list of options
            groupedOptions?.map((group) => [
              <GroupHeader key={group.header}>{group.header}</GroupHeader>,
              ...group.options.map((option, idx) => (
                <MenuItem key={idx} value={option.value}>
                  {option.displayValue ?? option.value}
                </MenuItem>
              )),
            ])}
        </MuiSelect>
      </FormControl>
    </Box>
  );
}
