/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteApiKey, deleteRemoteApiKey } from '@/client';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Box, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { RegenerateApiKey } from './RegenerateApiKey';
import { RevokeApiKey } from './RevokeApiKey';

export default function ApiKeyTabPanel() {
  const activeApplicationId = useActiveApplicationId();
  const [apiKey, setApiKey] = useState(Array(88).fill('-').join(''));
  const [didRegenerate, setDidRegenerate] = useState<boolean>(false);

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

        <Stack direction="row" className="gap-2 justify-between">
          <RevokeApiKey
            disabled={false}
            onDelete={() => {
              deleteRemoteApiKey(activeApplicationId);
              setApiKey('');
            }}
          />
          <RegenerateApiKey
            disabled={false}
            onConfirm={async () => {
              const { api_key: newApiKey } = await createRemoteApiKey(activeApplicationId);
              setDidRegenerate(true);
              setApiKey(newApiKey);
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
