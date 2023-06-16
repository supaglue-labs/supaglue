/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination, testDestination, updateDestination } from '@/client';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import getIcon from '@/utils/companyToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { Destination } from '@supaglue/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { postgresDestinationCardInfo } from './DestinationTabPanelContainer';

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
  const [password, setPassword] = useState<string>('');
  const [isTestSuccessful, setIsTestSuccessful] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
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
    setPassword(destination.config.password);
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<Destination> => {
    if (destination) {
      return await updateDestination({
        ...destination,
        type: 'postgres',
        name,
        config: {
          host,
          port,
          schema,
          database,
          user,
          password,
        },
      });
    }
    return await createDestination({
      applicationId: activeApplicationId,
      type: 'postgres',
      name,
      config: {
        host,
        port,
        database,
        schema,
        user,
        password,
      },
    });
  };

  const SaveButton = () => {
    return (
      <Button
        disabled={!isTestSuccessful || name === ''}
        variant="contained"
        onClick={async () => {
          const newDestination = await createOrUpdateDestination();
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
        }}
      >
        Save
      </Button>
    );
  };

  const TestButton = () => {
    return (
      <Button
        disabled={isTesting}
        variant="contained"
        color="secondary"
        onClick={async () => {
          setIsTesting(true);
          const response = await testDestination({
            applicationId: activeApplicationId,
            type: 'postgres',
            name,
            config: {
              host,
              port,
              database,
              schema,
              user,
              password,
            },
          });
          setIsTesting(false);
          if (response && response.success) {
            addNotification({ message: 'Successfully tested destination', severity: 'success' });
            setIsTestSuccessful(true);
          } else {
            addNotification({ message: `Failed testing destination: ${response.message}`, severity: 'error' });
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
            helperText={`Ensure that the host is accessible from the Supaglue servers (CIDR range found in Destination docs).`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setHost(event.target.value);
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
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDatabase(event.target.value);
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
            helperText="This is where tables will be written into (it must already exist)."
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSchema(event.target.value);
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
              setIsTestSuccessful(false);
            }}
          />
          <TextField
            required={true}
            error={!isNew && password === ''}
            value={password}
            size="small"
            label="Password"
            variant="outlined"
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
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
          {isTestSuccessful ? <SaveButton /> : <TestButton />}
        </Stack>
      </Stack>
    </Card>
  );
}
