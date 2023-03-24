/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteApiKey, deleteRemoteApiKey } from '@/client';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function ApiKeyTabPanel() {
  const activeApplicationId = useActiveApplicationId();
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
                if (!activeApplicationId) {
                  return;
                }
                const { api_key: newApiKey } = await createRemoteApiKey(activeApplicationId as string);
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
                if (!activeApplicationId) {
                  return;
                }
                deleteRemoteApiKey(activeApplicationId as string);
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
