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
import { s3DestinationCardInfo } from './DestinationTabPanelContainer';

export type S3DestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function S3DestinationDetailsPanel({ isLoading }: S3DestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 's3');

  const [name, setName] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [bucket, setBucket] = useState<string>('');
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isTestSuccessful, setIsTestSuccessful] = useState<boolean>(false);
  const router = useRouter();

  const isNew = !destination?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTesting(false);
    }, 3000); // sum of connection timeout + query timeout
    return () => clearTimeout(timer);
  }, [isTesting]);

  useEffect(() => {
    if (destination?.type !== 's3') {
      return;
    }

    setRegion(destination?.config?.region);
    setName(destination?.name);
    setBucket(destination?.config?.bucket);
    setAccessKeyId(destination?.config?.accessKeyId);
    setSecretAccessKey(destination?.config?.secretAccessKey);
  }, [destination?.id]);

  const createOrUpdateDestination = async (): Promise<Destination | undefined> => {
    if (destination) {
      const response = await updateDestination({
        ...destination,
        name,
        type: 's3',
        config: {
          region,
          bucket,
          accessKeyId,
          secretAccessKey,
        },
      });
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }
    const response = await createDestination({
      applicationId: activeApplicationId,
      type: 's3',
      name,
      config: {
        region,
        bucket,
        accessKeyId,
        secretAccessKey,
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
        disabled={!isTestSuccessful || name === ''}
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
            type: 's3',
            name,
            config: {
              region,
              bucket,
              accessKeyId,
              secretAccessKey,
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
            {getIcon(s3DestinationCardInfo.type, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{s3DestinationCardInfo.name}</Typography>
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
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Credentials</Typography>
          <TextField
            required={true}
            error={!isNew && accessKeyId === ''}
            value={accessKeyId}
            size="small"
            label="Access Key ID"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAccessKeyId(event.target.value);
              setIsTestSuccessful(false);
            }}
          />
          <TextField
            required={true}
            error={!isNew && secretAccessKey === ''}
            value={secretAccessKey}
            size="small"
            label="Secret Access Key"
            variant="outlined"
            type="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSecretAccessKey(event.target.value);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Region</Typography>
          <TextField
            required={true}
            error={!isNew && region === ''}
            value={region}
            size="small"
            label="AWS Region"
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRegion(event.target.value);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Bucket</Typography>
          <TextField
            required={true}
            error={!isNew && bucket === ''}
            value={bucket}
            size="small"
            label="Bucket"
            variant="outlined"
            helperText='Bucket name without "s3://" prefix or trailing slash.'
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setBucket(event.target.value);
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
