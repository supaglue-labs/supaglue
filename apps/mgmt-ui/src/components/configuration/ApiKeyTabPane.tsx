/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteApiKey, deleteRemoteApiKey } from '@/client';
import { useActiveApplication } from '@/context/activeApplication';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function ApiKeyTabPanel() {
  const { activeApplication } = useActiveApplication();
  const [apiKey, setApiKey] = useState('');

  return (
    <Box
      sx={{
        padding: 6,
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        height: 'full',
      }}
    >
      <Stack direction="column" className="gap-4 w-full">
        <Stack className="gap-2">
          <TextField
            value={apiKey}
            size="small"
            label="API key"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              // no-op to match controlled textfield signature
            }}
            helperText="You will only be able to view your API key upon generation. Keep it secret."
          />
        </Stack>

        <Stack direction="row" className="gap-2 justify-between">
          <Stack direction="row" className="gap-2">
            <Button
              variant="contained"
              onClick={async () => {
                const { api_key: newApiKey } = await createRemoteApiKey(activeApplication.id);
                setApiKey(newApiKey);
              }}
            >
              Regenerate
            </Button>
          </Stack>
          <Stack direction="row" className="gap-2">
            <Button
              variant="text"
              color="error"
              onClick={() => {
                deleteRemoteApiKey(activeApplication.id);
                setApiKey('');
              }}
            >
              Revoke
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
