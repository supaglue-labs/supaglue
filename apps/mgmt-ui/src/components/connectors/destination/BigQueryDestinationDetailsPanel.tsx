/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination, testDestination, updateDestination } from '@/client';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import getIcon from '@/utils/companyToIcon';
import { FileUploadOutlined } from '@mui/icons-material';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { DestinationSafeAny } from '@supaglue/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { bigQueryDestinationCardInfo } from './DestinationTabPanelContainer';

export type BigQueryDestinationDetailsPanelProps = {
  isLoading: boolean;
};

export default function BigQDestinationDetailsPanel({ isLoading }: BigQueryDestinationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const destination = existingDestinations.find((existingDestination) => existingDestination.type === 'bigquery');

  const isNew = !destination?.id;

  const [name, setName] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [dataset, setDataset] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
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
    if (destination?.type !== 'bigquery') {
      return;
    }

    setName(destination.name);
    setDataset(destination.config.dataset);
  }, [destination?.id]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      const serviceAccountFile = e.target?.result;
      if (typeof serviceAccountFile === 'string') {
        const serviceAccount = JSON.parse(serviceAccountFile);
        setProjectId(serviceAccount.project_id);
        setClientEmail(serviceAccount.client_email);
        setPrivateKey(serviceAccount.private_key);
        setIsDirty(true);
      }
    });
    fileReader.readAsText(file);
  };

  const createOrUpdateDestination = async (): Promise<DestinationSafeAny | undefined> => {
    if (destination) {
      const response = await updateDestination({
        ...destination,
        type: 'bigquery',
        name,
        config: {
          projectId,
          dataset,
          credentials: {
            clientEmail,
            privateKey,
          },
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
      type: 'bigquery',
      name,
      config: {
        projectId,
        dataset,
        credentials: {
          clientEmail,
          privateKey,
        },
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
            type: 'bigquery',
            name,
            config: {
              projectId,
              dataset,
              credentials: {
                clientEmail,
                privateKey,
              },
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
            {getIcon(bigQueryDestinationCardInfo.type, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{bigQueryDestinationCardInfo.name}</Typography>
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
          <Typography variant="subtitle1">Dataset</Typography>
          <TextField
            required={true}
            error={!isNew && dataset === ''}
            value={dataset}
            size="small"
            label="Dataset"
            variant="outlined"
            helperText="This is the dataset where tables will be written into (it must already exist). You can override this dataset per connection via the API later."
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDataset(event.target.value);
              setIsDirty(true);
              setIsTestSuccessful(false);
            }}
          />
        </Stack>

        <Stack className="gap-2">
          <Typography variant="subtitle1">Service Account Credentials</Typography>
          <Button variant="contained" component="label">
            <FileUploadOutlined />
            Upload Service Account JSON File
            <input style={{ display: 'none' }} type="file" hidden onChange={handleUpload} accept=".json" />
          </Button>
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
