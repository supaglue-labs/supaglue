/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination, testDestination, updateDestination } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import getIcon from '@/utils/companyToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { DestinationSafeAny, PostgresConfigAtLeastSafe } from '@supaglue/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { postgresDestinationCardInfo } from './DestinationTabPanelContainer';
import type { KnownOrUnknownValue } from './ExistingPasswordTextField';
import { ExistingPasswordTextField } from './ExistingPasswordTextField';

export type PostgresDestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function PostgresDestinationDetailsPanel({ isLoading }: PostgresDestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 'postgres');

  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [schema, setSchema] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<KnownOrUnknownValue>({ type: 'known', value: '' });
  const [sslMode, setSslMode] = useState<PostgresConfigAtLeastSafe['sslMode']>(undefined);
  const [serverCaCert, setServerCaCert] = useState<string | undefined>(undefined);
  const [clientCert, setClientCert] = useState<string | undefined>(undefined);
  const [clientKey, setClientKey] = useState<string | undefined>(undefined);
  const [serverName, setServerName] = useState<string | undefined>(undefined);
  const [isTestSuccessful, setIsTestSuccessful] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const router = useRouter();

  const isNew = !destination?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTesting(false);
    }, 3000); // sum of connection timeout + query timeout
    return () => clearTimeout(timer);
  }, [isTesting]);

  useEffect(() => {
    if (destination?.type !== 'postgres') {
      return;
    }

    setHost(destination.config.host);
    setName(destination.name);
    setPort(destination.config.port);
    setDatabase(destination.config.database);
    setSchema(destination.config.schema);
    setUser(destination.config.user);
    setPassword({ type: 'unknown' });
    setSslMode(destination.config.sslMode);
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<DestinationSafeAny | undefined> => {
    if (destination) {
      const response = await updateDestination({
        ...destination,
        type: 'postgres',
        name,
        config: {
          host,
          port,
          schema,
          database,
          user,
          password: password.type === 'known' ? password.value : undefined,
          sslMode,
          serverCaCert,
          clientCert,
          clientKey,
          serverName,
        },
        version: destination.version,
      });
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }
    const response = await createDestination({
      applicationId: activeApplicationId,
      type: 'postgres',
      name,
      config: {
        host,
        port,
        database,
        schema,
        user,
        password: password.type === 'known' ? password.value : '', // TODO: shouldn't allow empty string
        sslMode,
        serverCaCert,
        clientCert,
        clientKey,
        serverName,
      },
    });
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    return response.data;
  };

  const SaveButton = () => {
    return (
      <Button
        disabled={!isTestSuccessful || name === '' || !isDirty}
        variant="contained"
        onClick={async () => {
          const newDestination = await createOrUpdateDestination();
          if (!newDestination) {
            return;
          }
          addNotification({ message: 'Successfully updated destination', severity: 'success' });
          const latestDestinations = [
            ...existingDestinations.filter(({ id }) => id !== newDestination.id),
            newDestination,
          ];
          mutate(latestDestinations, {
            optimisticData: latestDestinations,
            revalidate: false,
            populateCache: false,
          });
          setIsDirty(false);
        }}
      >
        Save
      </Button>
    );
  };

  const TestButton = () => {
    return (
      <Button
        disabled={isTesting || !isDirty}
        variant="contained"
        color="secondary"
        onClick={async () => {
          setIsTesting(true);
          const response = await testDestination({
            id: destination?.id,
            applicationId: activeApplicationId,
            type: 'postgres',
            name,
            config: {
              host,
              port,
              database,
              schema,
              user,
              password: password.type === 'known' ? password.value : undefined,
              sslMode,
              serverCaCert,
              clientCert,
              clientKey,
              serverName,
            },
          } as any); // TODO: fix typing
          setIsTesting(false);
          if (!response.ok) {
            addNotification({ message: response.errorMessage, severity: 'error' });
            setIsTestSuccessful(false);
            return;
          }
          if (response.data && response.data.success) {
            addNotification({ message: 'Successfully tested destination', severity: 'success' });
            setIsTestSuccessful(true);
          } else {
            addNotification({ message: `Failed testing destination: ${response.data.message}`, severity: 'error' });
            setIsTestSuccessful(false);
          }
        }}
      >
        {isTesting ? 'Testing...' : 'Test'}
      </Button>
    );
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Card>
      <Stack direction="column" className="gap-4" sx={{ padding: '2rem' }}>
        <Stack direction="row" className="items-center justify-between w-full">
          <Stack direction="row" className="items-center justify-center gap-2">
            {getIcon(postgresDestinationCardInfo.type, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{postgresDestinationCardInfo.name}</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Destination Name</Typography>
          <TextField
            required={true}
            error={!isNew && name === ''}
            value={name}
            size="small"
            label="Name (must be unique)"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value);
              setIsDirty(true);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Host</Typography>
          <TextField
            required={true}
            error={!isNew && host === ''}
            value={host}
            size="small"
            label="Host"
            variant="outlined"
            helperText="Ensure that the host is accessible from the Supaglue servers (CIDR range found in Destination docs)."
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setHost(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Port</Typography>
          <TextField
            required={true}
            error={Number.isNaN(port)}
            value={port}
            size="small"
            label="Port"
            variant="outlined"
            type="number"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const portNum = parseInt(event.target.value, 10);
              setPort(portNum);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">SSL Mode</Typography>
          <Select
            name="SSL Mode"
            onChange={(value: string) => {
              setSslMode(value as PostgresConfigAtLeastSafe['sslMode']);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
            value={sslMode ?? 'disable'}
            options={[
              { value: 'disable' },
              { value: 'no-verify' },
              { value: 'prefer' },
              { value: 'require' },
              { value: 'verify-ca' },
              { value: 'verify-full' },
            ]}
          />
        </Stack>

        {sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full' ? (
          <>
            <Stack className="gap-2">
              <Typography variant="subtitle1">CA Certificate</Typography>
              <TextField
                required={false}
                multiline={true}
                minRows={3}
                value={serverCaCert}
                size="small"
                variant="outlined"
                placeholder="---BEGIN CERTIFICATE-----"
                helperText="The CA certificate used to verify the server's certificate."
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setServerCaCert(event.target.value);
                  setIsDirty(true);
                  setIsTestSuccessful(false);
                }}
              />
            </Stack>

            <Stack className="gap-2">
              <Typography variant="subtitle1">Client Certificate</Typography>
              <TextField
                required={false}
                multiline={true}
                minRows={3}
                value={clientCert}
                size="small"
                variant="outlined"
                placeholder="---BEGIN CERTIFICATE-----"
                helperText="The client public certificate used to authenticate to the server."
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setClientCert(event.target.value);
                  setIsDirty(true);
                  setIsTestSuccessful(false);
                }}
              />
            </Stack>

            <Stack className="gap-2">
              <Typography variant="subtitle1">Client Key</Typography>
              <TextField
                required={false}
                multiline={true}
                minRows={3}
                value={clientKey}
                size="small"
                variant="outlined"
                placeholder="---BEGIN RSA PRIVATE KEY-----"
                helperText="The client private key used to authenticate to the server."
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setClientKey(event.target.value);
                  setIsDirty(true);
                  setIsTestSuccessful(false);
                }}
              />
            </Stack>

            <Stack className="gap-2">
              <Typography variant="subtitle1">Server Name</Typography>
              <TextField
                required={false}
                value={serverName}
                size="small"
                label="Server Name"
                variant="outlined"
                helperText="The server name per the SNI TLS extension."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setServerName(event.target.value);
                  setIsDirty(true);
                  setIsTestSuccessful(false);
                }}
              />
            </Stack>
          </>
        ) : null}

        <Stack className="gap-2">
          <Typography variant="subtitle1">Database</Typography>
          <TextField
            required={true}
            error={!isNew && database === ''}
            value={database}
            size="small"
            label="Database"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDatabase(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Schema</Typography>
          <TextField
            required={true}
            error={!isNew && schema === ''}
            value={schema}
            size="small"
            label="Schema"
            variant="outlined"
            helperText="This is where tables will be written into (it must already exist). Use the Management ConnectionSyncConfigs API to override this."
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSchema(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Credentials</Typography>
          <TextField
            required={true}
            error={!isNew && user === ''}
            value={user}
            size="small"
            label="User"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUser(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
          <ExistingPasswordTextField
            required={true}
            error={!isNew && password.type === 'known' && password.value === ''}
            value={password}
            size="small"
            label="Password"
            variant="outlined"
            type="password"
            onChange={(value: KnownOrUnknownValue) => {
              setPassword(value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack direction="row" className="gap-2 justify-between">
          <Button
            variant="outlined"
            onClick={() => {
              router.back();
            }}
          >
            Back
          </Button>
          <Stack direction="row" className="gap-4">
            <TestButton />
            <SaveButton />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
