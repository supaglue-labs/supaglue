/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination, testDestination, updateDestination } from '@/client';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import getIcon from '@/utils/companyToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { DestinationSafeAny } from '@supaglue/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { snowflakeDestinationCardInfo } from './DestinationTabPanelContainer';

export type SnowflakeDestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function SnowflakeDestinationDetailsPanel({ isLoading }: SnowflakeDestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 'snowflake');

  const isNew = !destination?.id;

  const [name, setName] = useState<string>('');
  const [host, setHost] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [warehouse, setWarehouse] = useState<string>('');
  const [database, setDatabase] = useState<string>('');
  const [schema, setSchema] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isTestSuccessful, setIsTestSuccessful] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTesting(false);
    }, 3000); // sum of connection timeout + query timeout
    return () => clearTimeout(timer);
  }, [isTesting]);

  useEffect(() => {
    if (destination?.type !== 'snowflake') {
      return;
    }

    setName(destination.name);
    setHost(destination.config.host);
    setRole(destination.config.role);
    setWarehouse(destination.config.warehouse);
    setDatabase(destination.config.database);
    setSchema(destination.config.schema);
    setUsername(destination.config.username);
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<DestinationSafeAny | undefined> => {
    if (destination) {
      const response = await updateDestination({
        ...destination,
        type: 'snowflake',
        name,
        config: {
          host,
          role,
          warehouse,
          database,
          schema,
          username,
          password,
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
      type: 'snowflake',
      name,
      config: {
        host,
        role,
        warehouse,
        database,
        schema,
        username,
        password,
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
            type: 'snowflake',
            name,
            config: {
              host,
              role,
              warehouse,
              database,
              schema,
              username,
              password,
            },
          });
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
            {getIcon(snowflakeDestinationCardInfo.type, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{snowflakeDestinationCardInfo.name}</Typography>
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
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setHost(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Role</Typography>
          <TextField
            required={true}
            error={!isNew && role === ''}
            value={role}
            size="small"
            label="Role"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRole(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Warehouse</Typography>
          <TextField
            required={true}
            error={!isNew && warehouse === ''}
            value={warehouse}
            size="small"
            label="Warehouse"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setWarehouse(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Database</Typography>
          <TextField
            required={true}
            error={!isNew && database === ''}
            value={database}
            size="small"
            label="Database"
            variant="outlined"
            helperText=""
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
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSchema(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Username</Typography>
          <TextField
            required={true}
            error={!isNew && username === ''}
            value={username}
            size="small"
            label="Username"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Password</Typography>
          <TextField
            required={true}
            error={!isNew && password === ''}
            value={password}
            size="small"
            label="Password"
            variant="outlined"
            helperText=""
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
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
