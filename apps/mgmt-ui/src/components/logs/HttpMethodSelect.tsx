import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import * as React from 'react';

export default function HttpMethodSelect() {
  const [method, setMethod] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setMethod(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Http Method</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={method}
          label="Http Method"
          onChange={handleChange}
        >
          <MenuItem value="get">Get</MenuItem>
          <MenuItem value="post">Post</MenuItem>
          <MenuItem value="patch">Patch</MenuItem>
          <MenuItem value="delete">Delete</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
