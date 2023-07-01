/* eslint-disable @typescript-eslint/no-floating-promises */

import { createOrUpdateWebhook, deleteWebhook } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplication } from '@/hooks/useActiveApplication';
import { Box, Button, Stack, Switch, TextField, Typography } from '@mui/material';
import type { WebhookConfig } from '@supaglue/types';
import { useEffect, useState } from 'react';
import { DeleteWebhook } from './DeleteWebhook';

const defaultWebhook: WebhookConfig = {
  url: '',
  notifyOnConnectionError: false,
  notifyOnConnectionSuccess: false,
  notifyOnSyncError: false,
  notifyOnSyncSuccess: false,
};

export default function WebhookTabPanel() {
  const { activeApplication, isLoading, mutate } = useActiveApplication();
  const { addNotification } = useNotification();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [notifyOnConnectionSuccess, setNotifyOnConnectionSuccess] = useState<boolean>(false);
  const [notifyOnSyncSuccess, setNotifyOnSyncSuccess] = useState<boolean>(false);
  const [notifyOnConnectionError, setNotifyOnConnectionError] = useState<boolean>(false);
  const [notifyOnSyncError, setNotifyOnSyncError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const { url, notifyOnConnectionError, notifyOnConnectionSuccess, notifyOnSyncError, notifyOnSyncSuccess } =
      activeApplication?.config.webhook ?? defaultWebhook;
    setWebhookUrl(url);
    setNotifyOnConnectionSuccess(notifyOnConnectionSuccess);
    setNotifyOnSyncSuccess(notifyOnSyncSuccess);
    setNotifyOnConnectionError(notifyOnConnectionError);
    setNotifyOnSyncError(notifyOnSyncError);
  }, [JSON.stringify(activeApplication?.config.webhook)]);

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
          <Stack className="gap-4">
            <Typography sx={{ fontSize: 16 }}>Webhook URL</Typography>
            <TextField
              value={webhookUrl}
              size="small"
              label="Webhook URL"
              variant="outlined"
              disabled={isLoading}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setWebhookUrl(event.target.value);
              }}
            />
          </Stack>
          <Stack>
            <Typography sx={{ fontSize: 16 }}>Events</Typography>
            <SwitchWithLabel
              label="Notify on Connection Success"
              isLoading={isLoading}
              checked={notifyOnConnectionSuccess}
              onToggle={setNotifyOnConnectionSuccess}
            />
            <SwitchWithLabel
              label="Notify on Connection Error"
              isLoading={isLoading}
              checked={notifyOnConnectionError}
              onToggle={setNotifyOnConnectionError}
            />
            <SwitchWithLabel
              label="Notify on Sync Success"
              isLoading={isLoading}
              checked={notifyOnSyncSuccess}
              onToggle={setNotifyOnSyncSuccess}
            />
            <SwitchWithLabel
              label="Notify on Sync Error"
              isLoading={isLoading}
              checked={notifyOnSyncError}
              onToggle={setNotifyOnSyncError}
            />
          </Stack>
        </Stack>

        <Stack direction="row" className="gap-2 justify-between">
          <DeleteWebhook
            disabled={isLoading || isSaving || !activeApplication}
            onDelete={async () => {
              if (!activeApplication) {
                return;
              }
              setIsSaving(true);
              const response = await deleteWebhook(activeApplication.id);
              if (!response.ok) {
                setIsSaving(false);
                return addNotification({ message: response.errorMessage, severity: 'error' });
              }
              mutate({ ...activeApplication, config: { ...activeApplication.config, webhook: null } }, false);
              addNotification({ message: 'Successfully deleted webhook', severity: 'success' });
              setIsSaving(false);
            }}
          />
          <Button
            variant="contained"
            disabled={isLoading || isSaving || !activeApplication}
            onClick={async () => {
              if (!activeApplication) {
                return;
              }
              setIsSaving(true);
              const webhook = {
                url: webhookUrl.trim(),
                requestType: 'POST',
                notifyOnSyncSuccess,
                notifyOnSyncError,
                notifyOnConnectionSuccess,
                notifyOnConnectionError,
                headers: {
                  'Content-Type': 'application/json',
                },
              };
              const response = await createOrUpdateWebhook(activeApplication.id, webhook);
              if (!response.ok) {
                setIsSaving(false);
                return addNotification({ message: response.errorMessage, severity: 'error' });
              }
              mutate({ ...activeApplication, config: { ...activeApplication.config, webhook } }, false);
              addNotification({ message: 'Successfully updated webhook', severity: 'success' });
              setIsSaving(false);
            }}
          >
            Update
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

type SwitchWithLabelProps = {
  label: string;
  isLoading: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

function SwitchWithLabel({ label, isLoading, checked, onToggle }: SwitchWithLabelProps) {
  return (
    <Stack direction="row" className="gap-2 items-center">
      <Switch disabled={isLoading} checked={checked} onChange={(_, checked) => onToggle(checked)} />
      <Typography>{label}</Typography>
    </Stack>
  );
}
