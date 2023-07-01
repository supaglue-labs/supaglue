import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import * as React from 'react';

export default function StatusCodeSelect() {
  const [code, setCode] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setCode(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="status-code-select-label">Status Code</InputLabel>
        <Select
          labelId="status-code-select-label"
          id="status-code-select"
          value={code}
          label="Status Code"
          onChange={handleChange}
        >
          <MenuItem value="get">200 - OK</MenuItem>
          <MenuItem value="post">201 - Created</MenuItem>
          <MenuItem value="post">202 - Accepted</MenuItem>
          <MenuItem value="post">204 - No Content</MenuItem>
          <MenuItem value="post">206 - Partial Content</MenuItem>
          <MenuItem value="post">301 - Moved Permanently</MenuItem>
          <MenuItem value="post">400 - Bad Request</MenuItem>
          <MenuItem value="post">401 - Unauthorized</MenuItem>
          <MenuItem value="post">402 - Payment Required</MenuItem>
          <MenuItem value="post">403 - Forbidden</MenuItem>
          <MenuItem value="post">404 - Not Found</MenuItem>
          <MenuItem value="post">405 - Method Not Allowed</MenuItem>
          <MenuItem value="post">406 - Not Acceptable</MenuItem>
          <MenuItem value="post">407 - Proxy Authentication Required</MenuItem>
          <MenuItem value="post">408 - Request Timeout</MenuItem>
          <MenuItem value="post">409 - Conflict</MenuItem>
          <MenuItem value="post">410 - Gone</MenuItem>

          <MenuItem value="post">412 - Precondition Failed</MenuItem>
          <MenuItem value="post">413 - Payload Too Large</MenuItem>

          <MenuItem value="post">415 - Unsupported Media Type</MenuItem>
          <MenuItem value="post">426 - Upgrade Required</MenuItem>

          <MenuItem value="post">429 - Too Many Requests</MenuItem>
          <MenuItem value="post">500 - Internal Server Error</MenuItem>
          <MenuItem value="post">501 - Not Implemented</MenuItem>
          <MenuItem value="post">502 - Bad Gateway</MenuItem>
          <MenuItem value="post">503 - Service Unavailable</MenuItem>
          <MenuItem value="post">504 - Gateway Timeout</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
