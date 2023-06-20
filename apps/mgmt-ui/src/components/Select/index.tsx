import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';

export type SelectOption = {
  value: string;
  displayValue?: string;
};

export type SelectProps = {
  name: string;
  value: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  // If set, will add a None option to unselect
  unselect?: boolean;
  disabled?: boolean;
};

export default function Select({ name, value, options, onChange, unselect, disabled }: SelectProps) {
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
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value}>
              {option.displayValue ?? option.value}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </Box>
  );
}
