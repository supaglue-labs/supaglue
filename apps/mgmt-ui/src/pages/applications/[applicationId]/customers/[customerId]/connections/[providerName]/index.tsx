import { updateEntityMapping } from '@/client';
import Spinner from '@/components/Spinner';
import { TabPanel } from '@/components/TabPanel';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useActiveCustomerId } from '@/hooks/useActiveCustomerId';
import { toListEntityMappingsResponse, useEntityMappings } from '@/hooks/useEntityMappings';
import { useProperties } from '@/hooks/useProperties';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import { getStandardObjectOptions } from '@/utils/provider';
import providerToIcon from '@/utils/providerToIcon';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { EntityFieldMapping, MergedEntityFieldMapping, MergedEntityMapping } from '@supaglue/types/entity_mapping';
import { EntityMapping } from '@supaglue/types/entity_mapping';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export { getServerSideProps };

export default function Home() {
  const applicationId = useActiveApplicationId();
  const customerId = useActiveCustomerId();
  const { providerName } = useRouter().query;
  const { entityMappings = [], isLoading, mutate } = useEntityMappings(customerId, providerName as string);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { addNotification } = useNotification();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const saveEntityMapping = async (mergedEntityMapping: MergedEntityMapping) => {
    const { entityId, object, fieldMappings } = mergedEntityMapping;
    const entityMapping: EntityMapping = {
      entityId: entityId,
      object: object?.from === 'customer' ? object : undefined,
      fieldMappings: fieldMappings.filter(
        (fieldMapping) => fieldMapping.from === 'customer' && fieldMapping.mappedField
      ) as EntityFieldMapping[],
    };
    const response = await updateEntityMapping(applicationId, customerId, providerName as string, entityMapping);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    addNotification({ message: 'Successfully updated entity mapping', severity: 'success' });
    const idx = entityMappings.findIndex((entityMapping) => entityMapping.entityId === entityId);
    if (idx !== -1) {
      await mutate(
        toListEntityMappingsResponse([
          ...entityMappings.slice(0, idx),
          mergedEntityMapping,
          ...entityMappings.slice(idx + 1),
        ]),
        false
      );
    }
  };

  return (
    <>
      <Head>
        <title>Supaglue Management Portal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Connection" onDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          {isLoading ? (
            <Spinner />
          ) : (
            <Stack className="gap-2">
              <Breadcrumbs>
                <Link color="inherit" href={`/applications/${applicationId}`}>
                  Home
                </Link>
                <Link color="inherit" href={`/applications/${applicationId}/customers`}>
                  Customers
                </Link>
                <Link color="inherit" href={`/applications/${applicationId}/customers/${customerId}/connections`}>
                  Connections
                </Link>
                <Typography color="text.primary">Connection</Typography>
              </Breadcrumbs>
              <Card>
                <Typography variant="h6" component="h2" sx={{ p: 2 }}>
                  Entity Mappings
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tab}>
                    {entityMappings.map((mapping, idx) => (
                      <Tab key={idx} label={mapping.entityName} onClick={() => setTab(idx)} />
                    ))}
                  </Tabs>
                </Box>
                <Box component="main" sx={{ flex: 1, py: 6, px: 4 }}>
                  {entityMappings.map((mapping, idx) => (
                    <TabPanel value={tab} index={idx} key={idx} className="w-full">
                      <EntityMapping
                        initialMapping={mapping}
                        customerId={customerId}
                        entity={mapping.entityName}
                        providerName={providerName as string}
                        saveEntityMapping={saveEntityMapping}
                      />
                    </TabPanel>
                  ))}
                </Box>
              </Card>
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}

type EntityMappingsProps = {
  customerId: string;
  entity: string;
  providerName: string;
  initialMapping: MergedEntityMapping;
  saveEntityMapping: (mapping: MergedEntityMapping) => void;
};

function EntityMapping({ customerId, entity, providerName, initialMapping, saveEntityMapping }: EntityMappingsProps) {
  const [mergedEntityMapping, setMergedEntityMapping] = useState<MergedEntityMapping>(initialMapping);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const setObject = (selected: string | undefined) => {
    setMergedEntityMapping({
      ...mergedEntityMapping,
      object: selected
        ? {
            type: 'standard',
            name: selected,
            from: 'customer',
          }
        : undefined,
    });
    setIsDirty(true);
  };

  const setFieldMapping = (
    idx: number,
    entityField: string,
    mappedField: string | undefined,
    isAdditional: boolean
  ) => {
    const newFieldMappings = [...mergedEntityMapping.fieldMappings];
    newFieldMappings[idx] = {
      entityField,
      mappedField,
      from: 'customer',
      isAdditional,
    };
    setMergedEntityMapping({ ...mergedEntityMapping, fieldMappings: newFieldMappings });
    setIsDirty(true);
  };

  const addFieldMapping = () => {
    setMergedEntityMapping({
      ...mergedEntityMapping,
      fieldMappings: [
        ...mergedEntityMapping.fieldMappings,
        { entityField: '', mappedField: undefined, from: 'customer', isAdditional: true },
      ],
    });
    setIsDirty(true);
  };

  const deleteFieldMapping = (idx: number) => {
    const newFieldMappings = [...mergedEntityMapping.fieldMappings];
    newFieldMappings.splice(idx, 1);
    setMergedEntityMapping({ ...mergedEntityMapping, fieldMappings: newFieldMappings });
    setIsDirty(true);
  };

  const isValid =
    !!mergedEntityMapping.object &&
    mergedEntityMapping.fieldMappings.every((fieldMapping) => !!fieldMapping.mappedField && !!fieldMapping.entityField);

  return (
    <>
      <Box
        sx={{
          'max-width': 600,
        }}
      >
        <Grid container spacing={2}>
          <EntityObjectMapping
            entity={entity}
            providerName={providerName}
            object={initialMapping.object}
            setObject={setObject}
          />
          <EntityFieldMappings
            key={mergedEntityMapping.fieldMappings.length}
            customerId={customerId}
            entity={entity}
            allowAdditionalFieldMappings={mergedEntityMapping.allowAdditionalFieldMappings}
            providerName={providerName}
            object={mergedEntityMapping.object}
            fieldMappings={mergedEntityMapping.fieldMappings}
            setFieldMapping={setFieldMapping}
            addFieldMapping={addFieldMapping}
            deleteFieldMapping={deleteFieldMapping}
          />
        </Grid>
        <Stack direction="row" className="gap-2 pt-4 items-center justify-end">
          <Button
            variant="contained"
            color="primary"
            disabled={!isValid || !isDirty}
            onClick={() => {
              saveEntityMapping(mergedEntityMapping);
              setIsDirty(false);
            }}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </>
  );
}

type EntityObjectMappingProps = {
  entity: string;
  providerName: string;
  object?: StandardOrCustomObject & {
    from: 'developer' | 'customer';
  };
  setObject: (selected: string | undefined) => void;
};
function EntityObjectMapping({ entity, providerName, object, setObject }: EntityObjectMappingProps) {
  const objectOptions = getStandardObjectOptions(providerName);
  return (
    <>
      <Grid item xs={4}>
        <Stack direction="row" className="gap-2 items-center justify-between">
          <Stack direction="row" className="gap-2 items-center">
            {providerToIcon('supaglue', 40)}
            <Typography>{entity}</Typography>
          </Stack>
          <SyncAltIcon />
        </Stack>
      </Grid>
      <Grid item xs={8}>
        <Stack direction="row" className="gap-4 items-start">
          {providerToIcon(providerName, 40)}
          <Autocomplete
            disabled={object?.from === 'developer'}
            size="small"
            id="entity-object"
            options={objectOptions}
            defaultValue={object?.name}
            autoSelect
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Standard objects" helperText={`Available objects in ${providerName}.`} />
            )}
            onChange={(event: any, value: string | null) => {
              setObject(value ?? undefined);
            }}
          />
        </Stack>
      </Grid>
    </>
  );
}

type EntityFieldMappingsProps = {
  customerId: string;
  entity: string;
  object?: StandardOrCustomObject & {
    from: 'developer' | 'customer';
  };
  allowAdditionalFieldMappings: boolean;
  providerName: string;
  fieldMappings: MergedEntityFieldMapping[];
  setFieldMapping: (idx: number, entityField: string, mappedField: string | undefined, isAdditional: boolean) => void;
  addFieldMapping: () => void;
  deleteFieldMapping: (idx: number) => void;
};

function EntityFieldMappings({
  customerId,
  providerName,
  object,
  fieldMappings,
  allowAdditionalFieldMappings,
  setFieldMapping,
  addFieldMapping,
  deleteFieldMapping,
}: EntityFieldMappingsProps) {
  const { properties = [], isLoading } = useProperties(
    customerId,
    providerName,
    object?.type ?? 'standard',
    object?.name ?? ''
  );
  return (
    <>
      {fieldMappings.map(({ entityField, mappedField, from, isAdditional }, idx) => (
        <>
          <Grid item xs={4}>
            {isAdditional ? (
              <TextField
                required={true}
                value={entityField}
                size="small"
                label="Field Name (must be unique)"
                variant="outlined"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldMapping(idx, event.target.value, mappedField, true);
                }}
              />
            ) : (
              <Typography>{entityField}</Typography>
            )}
          </Grid>
          <Grid item xs={7}>
            <Autocomplete
              disabled={!object || isLoading || from === 'developer'}
              size="small"
              id="entity-object-field"
              options={properties ?? []}
              defaultValue={mappedField}
              autoSelect
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`${providerName} field`}
                  helperText={object ? `Available fields for ${object?.name} in ${providerName}.` : undefined}
                />
              )}
              onChange={(event: any, value: string | null) => {
                setFieldMapping(idx, entityField, value ?? undefined, isAdditional);
              }}
            />
          </Grid>
          <Grid item xs={1}>
            {isAdditional && (
              <IconButton onClick={() => deleteFieldMapping(idx)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
        </>
      ))}
      {allowAdditionalFieldMappings && <Button onClick={addFieldMapping}>+ Add field mapping</Button>}
    </>
  );
}
