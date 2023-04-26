/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination, updateDestination } from '@/client';
import Spinner from '@/components/Spinner';
import { SwitchWithLabel } from '@/components/SwitchWithLabel';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import getIcon from '@/utils/companyToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { Destination, PostgresConfigSafe } from '@supaglue/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { postgresDestinationCardInfo } from './DestinationTabPanelContainer';

export type PostgresDestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function PostgresDestinationDetailsPanel({ isLoading }: PostgresDestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();

  const { destinations: existingDestinations = [], mutate } = useDestinations();
  const { addNotification } = useNotification();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 'postgres');

  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [schema, setSchema] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sslmode, setSslmode] = useState<PostgresConfigSafe['sslmode']>('disable');
  const [sslaccept, setSslaccept] = useState<PostgresConfigSafe['sslaccept']>('accept_invalid_certs');
  const [ca, setCa] = useState<string>('');
  const [cert, setCert] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (destination?.type !== 'postgres') {
      return;
    }
    if (!host) {
      setHost(destination.config.host);
    }
    if (!name) {
      setName(destination.name);
    }
    if (!port) {
      setPort(destination.config.port);
    }
    if (!database) {
      setDatabase(destination.config.database);
    }
    if (!schema) {
      setSchema(destination.config.schema);
    }
    if (!user) {
      setUser(destination.config.user);
    }
    if (!ca) {
      setCa(destination.config.ca);
    }
    if (!cert) {
      setCert(destination.config.cert);
    }
    setSslmode(destination.config.sslmode ?? 'disable');
    setSslaccept(destination.config.sslaccept ?? 'accept_invalid_certs');
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<Destination> => {
    if (destination) {
      return await updateDestination({
        id: destination.id,
        applicationId: activeApplicationId,
        type: 'postgres',
        name,
        config: {
          host,
          port,
          schema,
          database,
          user,
          password,
          sslmode,
          sslaccept,
          ca,
          cert,
          key,
          passphrase,
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
        sslmode,
        sslaccept,
        ca,
        cert,
        key,
        passphrase,
      },
    });
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
            value={host}
            size="small"
            label="Host"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setHost(event.target.value);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Port</Typography>
          <TextField
            value={port}
            size="small"
            label="Port"
            variant="outlined"
            type="number"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPort(parseInt(event.target.value, 10));
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Database</Typography>
          <TextField
            value={database}
            size="small"
            label="Database"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDatabase(event.target.value);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Schema</Typography>
          <TextField
            value={schema}
            size="small"
            label="Schema"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSchema(event.target.value);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Credentials</Typography>
          <TextField
            value={user}
            size="small"
            label="User"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUser(event.target.value);
            }}
          />
          <TextField
            value={password}
            size="small"
            label="Password"
            variant="outlined"
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">SSL</Typography>
          <SwitchWithLabel
            label="Require SSL"
            isLoading={isLoading}
            checked={sslmode === 'require'}
            onToggle={(checked) => {
              setSslmode(checked ? 'require' : 'disable');
            }}
          />
          <TextField
            value={ca}
            placeholder={'-----BEGIN CERTIFICATE-----\nMIID...'}
            label="CA Certificate"
            variant="outlined"
            multiline
            rows={4}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCa(event.target.value);
            }}
          />
          <TextField
            value={cert}
            placeholder={'-----BEGIN CERTIFICATE-----\nMIID...'}
            label="Certificate"
            variant="outlined"
            multiline
            rows={4}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCert(event.target.value);
            }}
          />
          <TextField
            value={key}
            placeholder={'-----RSA PRIVATE KEY-----\nMIIE...'}
            label="Key"
            variant="outlined"
            multiline
            rows={4}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setKey(event.target.value);
            }}
          />
          <TextField
            value={passphrase}
            placeholder={'passphrase'}
            label="Passphrase"
            variant="outlined"
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassphrase(event.target.value);
            }}
          />
          <SwitchWithLabel
            label="Verify server certificate"
            isLoading={isLoading}
            checked={sslaccept === 'strict'}
            onToggle={(checked) => {
              setSslaccept(checked ? 'strict' : 'accept_invalid_certs');
            }}
          />
          <Typography variant="caption">Note: you must set a CA Certificate for this to work</Typography>
        </Stack>

        <Stack direction="row" className="gap-2 justify-between">
          <Stack direction="row" className="gap-2">
            <Button
              variant="outlined"
              disabled={isSaving}
              onClick={() => {
                router.back();
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              disabled={isSaving || isLoading}
              onClick={async () => {
                setIsSaving(true);
                const newDestination = await createOrUpdateDestination();
                addNotification({ message: 'Successfully updated postgres destination', severity: 'success' });
                const latestDestinations = [
                  ...existingDestinations.filter(({ id }) => id !== newDestination.id),
                  newDestination,
                ];
                mutate(latestDestinations, {
                  optimisticData: latestDestinations,
                  revalidate: false,
                  populateCache: false,
                });
                setIsSaving(false);
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
