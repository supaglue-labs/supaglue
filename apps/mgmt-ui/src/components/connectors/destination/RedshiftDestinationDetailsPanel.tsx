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
import { redshiftDestinationCardInfo } from './DestinationTabPanelContainer';

export type RedshiftDestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function RedshiftDestinationDetailsPanel({ isLoading }: RedshiftDestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 'redshift');

  const isNew = !destination?.id;

  const [name, setName] = useState<string>('');
  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<number>(5439);
  const [username, setUsername] = useState<string>('');
  const [database, setDatabase] = useState<string>('');
  const [schema, setSchema] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<string>('s3_staging');
  const [s3KeyId, setS3KeyId] = useState<string>('');
  const [s3BucketName, setS3BucketName] = useState<string>('');
  const [s3BucketRegion, setS3BucketRegion] = useState<string>('');
  const [s3AccessKey, setS3AccessKey] = useState<string>('');
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
    if (destination?.type !== 'redshift') {
      return;
    }

    setName(destination.name);
    setHost(destination.config.host);
    setPort(destination.config.port);
    setUsername(destination.config.username);
    setDatabase(destination.config.database);
    setSchema(destination.config.schema);
    setS3KeyId(destination.config.s3KeyId);
    setS3BucketName(destination.config.s3BucketName);
    setS3BucketRegion(destination.config.s3BucketRegion);
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<DestinationSafeAny | undefined> => {
    if (destination) {
      const response = await updateDestination({
        ...destination,
        type: 'redshift',
        name,
        config: {
          host,
          port,
          username,
          database,
          schema,
          uploadMethod,
          s3KeyId,
          s3BucketName,
          s3BucketRegion,
          s3AccessKey,
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
      type: 'redshift',
      name,
      config: {
        host,
        port,
        username,
        database,
        schema,
        uploadMethod,
        s3KeyId,
        s3BucketName,
        s3BucketRegion,
        s3AccessKey,
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
            type: 'redshift',
            name,
            config: {
              host,
              port,
              username,
              database,
              schema,
              uploadMethod,
              s3KeyId,
              s3BucketName,
              s3BucketRegion,
              s3AccessKey,
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
            {getIcon(redshiftDestinationCardInfo.type, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{redshiftDestinationCardInfo.name}</Typography>
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
          <Typography variant="subtitle1">Port</Typography>
          <TextField
            required={true}
            error={!isNew && port === 0}
            value={port}
            size="small"
            label="Port"
            variant="outlined"
            helperText=""
            type="number"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPort(parseInt(event.target.value, 10));
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
          <Typography variant="subtitle1">S3 Key ID</Typography>
          <TextField
            required={true}
            error={!isNew && s3KeyId === ''}
            value={s3KeyId}
            size="small"
            label="S3 Key ID"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setS3KeyId(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">S3 Bucket Name</Typography>
          <TextField
            required={true}
            error={!isNew && s3BucketName === ''}
            value={s3BucketName}
            size="small"
            label="S3 Bucket Name"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setS3BucketName(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">S3 Bucket Region</Typography>
          <TextField
            required={true}
            error={!isNew && s3BucketRegion === ''}
            value={s3BucketRegion}
            size="small"
            label="S3 Bucket Region"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setS3BucketRegion(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">S3 Access Key</Typography>
          <TextField
            required={true}
            error={!isNew && s3AccessKey === ''}
            value={s3AccessKey}
            size="small"
            label="S3 Access Key"
            variant="outlined"
            helperText=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setS3AccessKey(event.target.value);
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
