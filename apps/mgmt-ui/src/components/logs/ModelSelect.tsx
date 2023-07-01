import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import * as React from 'react';

export default function ModelSelect() {
  const [method, setMethod] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setMethod(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select labelId="model-select-label" id="model-select" value={method} label="Model" onChange={handleChange}>
          <MenuItem value="account">Account</MenuItem>
          <MenuItem value="contact">Contact</MenuItem>
          <MenuItem value="lead">Lead</MenuItem>
          <MenuItem value="opportunity">Opportunity</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
