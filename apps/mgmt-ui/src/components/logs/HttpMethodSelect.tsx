import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { HttpRequestType } from '@supaglue/core/types';

export type HttpMethodSelectProps = {
  value: HttpRequestType;
  onChange: (requestType: HttpRequestType) => void;
};

export default function HttpMethodSelect({ value, onChange }: HttpMethodSelectProps) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="http-method-select-label">Http Method</InputLabel>
        <Select
          labelId="http-method-select-label"
          id="http-method-select"
          value={value}
          label="Http Method"
          onChange={(event) => onChange(event.target.value as HttpRequestType)}
        >
          <MenuItem value="GET">GET</MenuItem>
          <MenuItem value="POST">POST</MenuItem>
          <MenuItem value="PUT">PUT</MenuItem>
          <MenuItem value="PATCH">PATCH</MenuItem>
          <MenuItem value="DELETE">DELETE</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
