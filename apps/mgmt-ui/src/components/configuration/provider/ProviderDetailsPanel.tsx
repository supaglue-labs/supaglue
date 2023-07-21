/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteProvider, deleteProvider, updateRemoteProvider } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useProviders } from '@/hooks/useProviders';
import { useSchemas } from '@/hooks/useSchemas';
import { getStandardObjectOptions } from '@/utils/provider';
import providerToIcon from '@/utils/providerToIcon';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import type {
  OauthProvider,
  Provider,
  ProviderCategory,
  ProviderCreateParams,
  ProviderName,
  ProviderObject,
} from '@supaglue/types';
import { CRM_COMMON_OBJECT_TYPES } from '@supaglue/types/crm';
import { ENGAGEMENT_COMMON_OBJECT_TYPES } from '@supaglue/types/engagement';
import { PROVIDERS_THAT_SUPPORT_SCHEMAS } from '@supaglue/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DeleteProviderButton } from './DeleteProviderButton';
import { providerCardsInfo } from './ProviderTabPanelContainer';

export type ProviderDetailsPanelProps = {
  category: ProviderCategory;
  providerName: ProviderName;
  isLoading: boolean;
};

export default function ProviderDetailsPanel({ providerName, category, isLoading }: ProviderDetailsPanelProps) {
  const shouldAllowManagedOauth = ['salesforce', 'hubspot'].includes(providerName);
  const isOauth = category === 'crm' || providerName !== 'apollo';
  const activeApplicationId = useActiveApplicationId();
  const { schemas, isLoading: isLoadingSchemas } = useSchemas();
  const { addNotification } = useNotification();
  const [friendlyProviderId, setFriendlyProviderId] = useState<string>('--');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [oauthScopes, setOauthScopes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [useManagedOauth, setUseManagedOauth] = useState<boolean>(true);
  const [commonObjects, setCommonObjects] = useState<ProviderObject[]>([]);
  const [standardObjects, setStandardObjects] = useState<ProviderObject[]>([]);
  const [customObjects, setCustomObjects] = useState<ProviderObject[]>([]);
  const router = useRouter();

  const supportsObjectToSchema = (PROVIDERS_THAT_SUPPORT_SCHEMAS as unknown as ProviderName[]).includes(providerName);

  const { providers: existingProviders = [], mutate } = useProviders();

  const provider = existingProviders.find((existingProvider) => existingProvider.name === providerName);

  const providerCardInfo = providerCardsInfo.find((providerCardInfo) => providerCardInfo.providerName === providerName);

  useEffect(() => {
    setFriendlyProviderId(provider?.id ?? '--');
    if (provider?.category === 'crm' || provider?.name !== 'apollo') {
      setClientId(provider?.config?.oauth?.credentials?.oauthClientId ?? '');

      setClientSecret(provider?.config?.oauth?.credentials?.oauthClientSecret ?? '');

      setOauthScopes(provider?.config?.oauth?.oauthScopes?.join(',') ?? '');
      setUseManagedOauth(
        provider?.id ? Boolean(provider?.config?.useManagedOauth) && shouldAllowManagedOauth : shouldAllowManagedOauth
      );
    }

    setCommonObjects(provider?.objects?.common ?? []);
    setStandardObjects(provider?.objects?.standard ?? []);
    setCustomObjects(provider?.objects?.custom ?? []);
  }, [provider?.id]);

  const createOrUpdateProvider = async (): Promise<Provider | undefined> => {
    if (provider) {
      const newProvider = {
        ...provider,
        config: isOauth
          ? {
              ...(provider as OauthProvider).config,
              providerAppId: '', // TODO: add input field for this
              oauth: {
                ...(provider as OauthProvider).config.oauth,
                credentials: {
                  oauthClientId: clientId,
                  oauthClientSecret: clientSecret,
                },
                oauthScopes: oauthScopes.split(','),
              },
            }
          : undefined,
        objects: {
          common: commonObjects,
          standard: standardObjects,
          custom: customObjects,
        },
      };
      const response = await updateRemoteProvider(activeApplicationId, newProvider as Provider);
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }
    const response = await createRemoteProvider(activeApplicationId, {
      applicationId: activeApplicationId,
      authType: isOauth ? 'oauth2' : 'api_key',
      category,
      name: providerName as ProviderName,
      config: isOauth
        ? {
            providerAppId: '', // TODO: add input field for this
            useManagedOauth,
            oauth: {
              credentials: {
                oauthClientId: clientId,
                oauthClientSecret: clientSecret,
              },
              oauthScopes: oauthScopes.split(','),
            },
          }
        : undefined,
      objects: {
        common: commonObjects,
        standard: standardObjects,
        custom: customObjects,
      },
    } as ProviderCreateParams);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    return response.data;
  };

  if (!providerCardInfo) {
    return null;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Card>
      <Stack direction="column" className="gap-4" sx={{ padding: '2rem' }}>
        <Stack direction="row" className="items-center gap-2">
          {providerToIcon(providerCardInfo.providerName, 35)}
          <Stack direction="column">
            <Typography variant="subtitle1">{providerCardInfo.name}</Typography>
            <Typography fontSize={12}>{providerCardInfo.category.toUpperCase()}</Typography>
          </Stack>
        </Stack>
        <Stack className="gap-2">
          <Typography variant="subtitle1">Provider Metadata</Typography>
          <TextField value={friendlyProviderId} size="small" label="ID" variant="outlined" disabled />
        </Stack>
        {shouldAllowManagedOauth && (
          <Box className="">
            <FormControlLabel
              control={
                <Switch
                  disabled={provider?.id ? true : false}
                  checked={useManagedOauth}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setUseManagedOauth(event.target.checked);
                  }}
                />
              }
              label="Managed OAuth2 App"
            />
            <FormHelperText sx={{ marginY: 0, marginLeft: '14px' }}>
              Use Supaglue's credentials. This cannot be changed once saved.
            </FormHelperText>
          </Box>
        )}
        {isOauth && (
          <Stack className="gap-2">
            <Typography variant="subtitle1">Credentials</Typography>
            <TextField
              disabled={useManagedOauth}
              value={clientId}
              size="small"
              label="Client ID"
              variant="outlined"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setClientId(event.target.value);
              }}
            />
            <TextField
              disabled={useManagedOauth}
              value={clientSecret}
              size="small"
              label="Client Secret"
              variant="outlined"
              type="password"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setClientSecret(event.target.value);
              }}
            />
            <TextField
              disabled={useManagedOauth || providerName === 'ms_dynamics_365_sales' || providerName === 'salesloft'}
              value={oauthScopes}
              size="small"
              label="OAuth2 scopes"
              variant="outlined"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setOauthScopes(event.target.value);
              }}
              helperText="Comma separated values (without spaces)."
            />
          </Stack>
        )}
        {supportsObjectToSchema && (
          <Stack className="gap-2">
            <Typography variant="subtitle1">Object to Schema Mapping</Typography>
            <SchemaToObjectMapping
              isLoading={isLoading || isLoadingSchemas}
              label="Common Objects"
              helperText={`Objects that Supaglue has unified across all ${category} providers.`}
              objects={commonObjects}
              setObjects={setCommonObjects}
              objectOptions={
                (category === 'crm' ? CRM_COMMON_OBJECT_TYPES : ENGAGEMENT_COMMON_OBJECT_TYPES) as unknown as string[]
              }
              schemaOptions={schemas ?? []}
            />
            <SchemaToObjectMapping
              isLoading={isLoading || isLoadingSchemas}
              label="Standard Objects"
              helperText={`Standard objects in ${providerName}. (Note: names are case-sensitive.)`}
              objects={standardObjects}
              setObjects={setStandardObjects}
              objectOptions={getStandardObjectOptions(providerName)}
              schemaOptions={schemas ?? []}
            />
            <SchemaToObjectMapping
              isLoading={isLoading || isLoadingSchemas}
              label="Custom Objects"
              helperText={`Custom objects in ${providerName}. (Note: names are case-sensitive.)`}
              objects={customObjects}
              setObjects={setCustomObjects}
              objectOptions={[]}
              schemaOptions={schemas ?? []}
            />
          </Stack>
        )}

        <Stack direction="row" className="gap-2 justify-between">
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={() => {
              router.back();
            }}
          >
            Back
          </Button>
          <Stack direction="row" className="gap-2">
            {provider && (
              <DeleteProviderButton
                providerName={providerName}
                onDelete={async () => {
                  const response = await deleteProvider(activeApplicationId, provider.id);
                  if (!response.ok) {
                    addNotification({ message: response.errorMessage, severity: 'error' });
                    return;
                  }
                  addNotification({ message: `Successfully removed ${providerName} provider`, severity: 'success' });
                  const filtered = existingProviders.filter((p) => p.id !== provider.id);
                  await mutate(filtered, {
                    optimisticData: filtered,
                    revalidate: false,
                    populateCache: false,
                  });
                  router.back();
                }}
              />
            )}
            <Button
              variant="contained"
              disabled={isSaving || isLoading}
              onClick={async () => {
                setIsSaving(true);
                const newProvider = await createOrUpdateProvider();
                if (!newProvider) {
                  setIsSaving(false);
                  return;
                }
                const latestProviders = [
                  ...existingProviders.filter((provider) => provider.id !== newProvider.id),
                  newProvider,
                ];
                addNotification({ message: 'Successfully updated provider', severity: 'success' });
                await mutate(latestProviders, {
                  optimisticData: latestProviders,
                  revalidate: false,
                  populateCache: false,
                });
                setIsSaving(false);
              }}
            >
              {providerName === 'apollo' ? 'Enable' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

type SchemaToObjectMappingProps = {
  isLoading: boolean;
  label: string;
  helperText: string;
  objects: ProviderObject[];
  setObjects: (objects: ProviderObject[]) => void;
  objectOptions: string[];
  schemaOptions: { id: string; name: string }[];
};

const SchemaToObjectMapping = ({
  isLoading,
  objects,
  label,
  helperText,
  setObjects,
  objectOptions,
  schemaOptions,
}: SchemaToObjectMappingProps) => {
  return (
    <>
      <Stack direction="row" className="gap-2 items-center">
        <Typography variant="subtitle1">{label}</Typography>
        <IconButton
          onClick={() => {
            setObjects([...objects, { name: '' }]);
          }}
          className="p-1"
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Stack>
      {/* Set key to force re-render on deletions */}
      <Stack key={objects.length} direction="column" className="gap-2 pl-2">
        {objects.map((object, index) => {
          return (
            <Stack key={index} direction="row" className="gap-2 items-top">
              <Autocomplete
                sx={{ width: 400 }}
                size="small"
                id={label}
                options={objectOptions}
                defaultValue={object.name}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => <TextField {...params} label={label} helperText={helperText} />}
                autoSelect
                freeSolo
                onChange={(event: any, value: string | null) => {
                  const newObjects = [...objects];
                  newObjects[index].name = value ?? '';
                  setObjects(newObjects);
                }}
              />
              <Select
                name="Schema"
                disabled={isLoading}
                unselect
                onChange={(selected) => {
                  const newObjects = [...objects];
                  newObjects[index].schemaId = selected;
                  setObjects(newObjects);
                }}
                value={object.schemaId ?? ''}
                options={schemaOptions.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
              />
              <IconButton
                className="p-1 h-10"
                onClick={() => {
                  setObjects([...objects.slice(0, index), ...objects.slice(index + 1)]);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>
    </>
  );
};
