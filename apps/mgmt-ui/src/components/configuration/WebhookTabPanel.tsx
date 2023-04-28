/* eslint-disable @typescript-eslint/no-floating-promises */
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { deleteWebhook } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplication } from '@/hooks/useActiveApplication';
import { Box, Button, IconButton, Stack, Switch, TextField, Typography } from '@mui/material';
import { HttpRequestType, WebhookConfig } from '@supaglue/types';
import { useEffect, useState } from 'react';
import HttpMethodSelect from '../logs/HttpMethodSelect';

const defaultWebhook: WebhookConfig = {
  url: '',
  notifyOnConnectionError: false,
  notifyOnConnectionSuccess: false,
  notifyOnSyncError: false,
  notifyOnSyncSuccess: false,
};
const defaultHeadersList = [{ name: '', value: '' }];

export default function WebhookTabPanel() {
  const { activeApplication, isLoading, mutate } = useActiveApplication();
  const { addNotification } = useNotification();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [notifyOnConnectionSuccess, setNotifyOnConnectionSuccess] = useState<boolean>(false);
  const [notifyOnSyncSuccess, setNotifyOnSyncSuccess] = useState<boolean>(false);
  const [notifyOnConnectionError, setNotifyOnConnectionError] = useState<boolean>(false);
  const [notifyOnSyncError, setNotifyOnSyncError] = useState<boolean>(false);
  const [requestType, setRequestType] = useState<HttpRequestType>('POST');
  const [headersList, setHeadersList] = useState<{ name: string; value: string }[]>(defaultHeadersList);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const { url, notifyOnConnectionError, notifyOnConnectionSuccess, notifyOnSyncError, notifyOnSyncSuccess, headers } =
      activeApplication?.config.webhook ?? defaultWebhook;
    setWebhookUrl(url);
    setNotifyOnConnectionSuccess(notifyOnConnectionSuccess);
    setNotifyOnSyncSuccess(notifyOnSyncSuccess);
    setNotifyOnConnectionError(notifyOnConnectionError);
    setNotifyOnSyncError(notifyOnSyncError);
    if (headers && Object.keys(headers).length) {
      setHeadersList(Object.entries(headers).map(([name, value]) => ({ name, value: value.toString() })));
    } else {
      setHeadersList(defaultHeadersList);
    }
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
            <HttpMethodSelect value={'POST'} onChange={setRequestType} />
          </Stack>
          <Typography sx={{ fontSize: 16 }} className="pl-2 pt-2">
            Events
          </Typography>
          <Stack>
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
          <Typography sx={{ fontSize: 16 }} className="pl-2 pt-2">
            Headers
          </Typography>
          <Headers headersList={headersList} setHeadersList={setHeadersList} isLoading={isLoading} />
        </Stack>

        <Stack direction="row" className="gap-2 justify-between">
          <Stack direction="row" className="gap-2">
            <Button
              variant="contained"
              disabled={isLoading || isSaving || !activeApplication}
              onClick={async () => {
                if (!activeApplication) {
                  return;
                }
                setIsSaving(true);
                const headers = Object.fromEntries(
                  headersList.filter(({ name }) => !!name).map(({ name, value }) => [name, value])
                );
                const webhook = {
                  url: webhookUrl.trim(),
                  requestType,
                  notifyOnSyncSuccess,
                  notifyOnSyncError,
                  notifyOnConnectionSuccess,
                  notifyOnConnectionError,
                  headers,
                };
                mutate({ ...activeApplication, config: { ...activeApplication.config, webhook } }, false);
                addNotification({ message: 'Successfully updated webhook', severity: 'success' });
                setIsSaving(false);
              }}
            >
              Update
            </Button>
          </Stack>
          <Stack direction="row" className="gap-2">
            <Button
              variant="text"
              color="error"
              disabled={isLoading || isSaving || !activeApplication}
              onClick={async () => {
                if (!activeApplication) {
                  return;
                }
                setIsSaving(true);
                deleteWebhook(activeApplication.id);
                mutate({ ...activeApplication, config: { ...activeApplication.config, webhook: null } }, false);
                addNotification({ message: 'Successfully deleted webhook', severity: 'success' });
                setIsSaving(false);
              }}
            >
              Delete
            </Button>
          </Stack>
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

type HeadersProps = {
  headersList: { name: string; value: string }[];
  setHeadersList: (headersList: { name: string; value: string }[]) => void;
  isLoading: boolean;
};

function Headers({ headersList, setHeadersList, isLoading }: HeadersProps) {
  const onSetNthKey = (name: string, n: number) => {
    const newHeadersList = [...headersList];
    newHeadersList[n].name = name;
    setHeadersList(newHeadersList);
  };

  const onSetNthValue = (value: string, n: number) => {
    const newHeadersList = [...headersList];
    newHeadersList[n].value = value;
    setHeadersList(newHeadersList);
  };

  const onDeleteNth = (n: number) => {
    setHeadersList(headersList.splice(n, 1));
  };

  const onAdd = () => {
    setHeadersList([...headersList, { name: '', value: '' }]);
  };

  return (
    <Stack direction="column" className="gap-4">
      {headersList.map(({ name, value }, idx) => (
        <HeaderRow
          key={idx}
          name={name}
          value={value}
          isLoading={isLoading}
          onSetKey={(name) => onSetNthKey(name, idx)}
          onSetValue={(value) => onSetNthValue(value, idx)}
          onDelete={() => onDeleteNth(idx)}
        />
      ))}
      <IconButton onClick={onAdd} size="small" sx={{ width: '2rem', height: '2rem' }}>
        <AddIcon />
      </IconButton>
    </Stack>
  );
}

type HeaderRowProps = {
  name: string;
  value: string;
  isLoading: boolean;
  onSetKey: (key: string) => void;
  onSetValue: (value: string) => void;
  onDelete: () => void;
};

function HeaderRow({ name, value, onSetKey, onSetValue, isLoading, onDelete }: HeaderRowProps) {
  return (
    <Stack direction="row" className="ml-2 gap-2">
      <TextField
        value={name}
        size="small"
        label="Header Name"
        variant="outlined"
        placeholder="Content-Type"
        disabled={isLoading}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onSetKey(event.target.value);
        }}
      />
      <TextField
        value={value}
        size="small"
        label="Header Value"
        placeholder="application/json"
        variant="outlined"
        disabled={isLoading}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onSetValue(event.target.value);
        }}
      />
      <IconButton onClick={onDelete} size="small">
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}
