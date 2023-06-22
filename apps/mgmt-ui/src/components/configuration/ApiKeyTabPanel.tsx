/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteApiKey } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Box, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { RegenerateApiKey } from './RegenerateApiKey';

export default function ApiKeyTabPanel() {
  const activeApplicationId = useActiveApplicationId();
  const [apiKey, setApiKey] = useState(Array(88).fill('-').join(''));
  const [didRegenerate, setDidRegenerate] = useState<boolean>(false);
  const { addNotification } = useNotification();

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
            type={didRegenerate ? 'text' : 'password'}
            label="API key"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              // no-op to match controlled textfield signature
            }}
            helperText="You will only be able to view your API key upon generation. Keep it secret."
          />
        </Stack>

        <Stack direction="row" className="gap-2 justify-end">
          <RegenerateApiKey
            disabled={false}
            onConfirm={async () => {
              const response = await createRemoteApiKey(activeApplicationId);
              if (!response.ok) {
                return addNotification({ message: response.errorMessage, severity: 'error' });
              }
              setDidRegenerate(true);
              setApiKey(response.data.api_key);
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
