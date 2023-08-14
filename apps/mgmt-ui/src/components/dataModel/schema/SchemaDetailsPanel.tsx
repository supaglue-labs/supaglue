/* eslint-disable @typescript-eslint/no-floating-promises */
import { createSchema, updateSchema } from '@/client';
import Spinner from '@/components/Spinner';
import { SwitchWithLabel } from '@/components/SwitchWithLabel';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { toGetSchemasResponse, useSchemas } from '@/hooks/useSchemas';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Autocomplete, Breadcrumbs, Button, Chip, Grid, Stack, TextField, Tooltip, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { Schema, SchemaCreateParams } from '@supaglue/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function SchemaDetailsPanel({ schemaId }: { schemaId: string }) {
  return <SchemaDetailsPanelImpl schemaId={schemaId} />;
}

export function NewSchemaPanel() {
  return <SchemaDetailsPanelImpl />;
}

type SchemaDetailsPanelImplProps = {
  schemaId?: string;
};

function SchemaDetailsPanelImpl({ schemaId }: SchemaDetailsPanelImplProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { schemas = [], isLoading, mutate } = useSchemas();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [fields, setFields] = useState<string[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [allowAdditionalFieldMappings, setAllowAdditionalFieldMappings] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const router = useRouter();

  const isFormValid = name && fields.length > 0;

  const schema = schemas.find((s) => s.id === schemaId);

  useEffect(() => {
    setFields(schema?.config.fields.map((field) => field.name) ?? []);
    setName(schema?.name ?? undefined);
    setMappedFields(
      schema?.config.fields.reduce((acc, field) => ({ ...acc, [field.name]: field.mappedName }), {}) ?? {}
    );
    setAllowAdditionalFieldMappings(schema?.config.allowAdditionalFieldMappings ?? false);
  }, [schema?.id]);

  if (isLoading) {
    return <Spinner />;
  }

  const formTitle = schema ? 'Edit Schema' : 'New Schema';
  const isNew = !schema?.id;

  const createOrUpdateSchema = async (): Promise<Schema | undefined> => {
    if (!name) {
      addNotification({ message: 'Name must be non-empty', severity: 'error' });
      return;
    }
    if (isLoading) {
      addNotification({ message: 'Cannot save while loading', severity: 'error' });
      return;
    }
    if (!fields.length) {
      addNotification({ message: 'At least one field must be selected', severity: 'error' });
      return;
    }

    if (schema) {
      const newSchema: Schema = {
        ...schema,
        name,
        config: {
          allowAdditionalFieldMappings,
          fields: fields.map((field) => ({ name: field, mappedName: mappedFields[field] })),
        },
      };
      const response = await updateSchema(activeApplicationId, newSchema);
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }

    // create path
    const newSchema: SchemaCreateParams = {
      applicationId: activeApplicationId,
      name,
      config: {
        allowAdditionalFieldMappings,
        fields: fields.map((field) => ({ name: field, mappedName: mappedFields[field] })),
      },
    };
    const response = await createSchema(activeApplicationId, newSchema);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    return response.data;
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Link color="inherit" href={`/applications/${activeApplicationId}`}>
          Home
        </Link>
        <Link color="inherit" href={`/applications/${activeApplicationId}/data_model/sync_configs`}>
          <Typography color="text.primary">Schemas</Typography>
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Card>
        <Stack direction="column" className="gap-2" sx={{ padding: '2rem' }}>
          <Stack direction="row" className="items-center justify-between w-full">
            <Stack direction="column">
              <Typography variant="subtitle1">{formTitle}</Typography>
            </Stack>
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Name</Typography>
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
            <Typography variant="subtitle1">Schema Fields</Typography>
            <Autocomplete
              disabled={isLoading || isSaving}
              key={schema?.name}
              size="small"
              multiple
              id="fields"
              options={[]}
              defaultValue={schema?.config.fields.map((field) => field.name) ?? []}
              autoSelect
              freeSolo
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Fields"
                  helperText={`Enter schema fields here. (Note: names are case-sensitive. Use "enter" to add multiple fields.)`}
                />
              )}
              onChange={(event: any, value: string[]) => {
                setFields(value.map((v) => v.trim()));
                setIsDirty(true);
              }}
            />
            <Stack direction="column" className="gap-2">
              <Typography variant="subtitle1">Field Mappings</Typography>
              <Stack direction="column" className="gap-2 pt-2">
                {fields.map((field) => {
                  return (
                    <Grid key={field} container spacing={4} className="pl-4">
                      <Grid item xs={2} className="flex flex-row gap-2 items-center">
                        <Typography variant="subtitle1">{field}</Typography>
                        <Tooltip title="Name of the schema field in your system">
                          <InfoOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.6);' }} />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={2}>
                        <Tooltip title="Set this if you want the schema field to be mapped to this field for all customers.">
                          <TextField
                            value={mappedFields[field] ?? ''}
                            size="small"
                            label="Mapped Field"
                            variant="outlined"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              setMappedFields({ ...mappedFields, [field]: event.target.value ?? '' });
                              setIsDirty(true);
                            }}
                          />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
          <Stack className="gap-2">
            <SwitchWithLabel
              label="Allow additional field mappings?"
              isLoading={isLoading}
              checked={allowAdditionalFieldMappings}
              onToggle={(toggled) => {
                setAllowAdditionalFieldMappings(toggled);
                setIsDirty(true);
              }}
            />
          </Stack>
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
            <Button
              variant="contained"
              disabled={!isFormValid || isSaving || isLoading || !isDirty}
              onClick={async () => {
                setIsSaving(true);
                const newSchema = await createOrUpdateSchema();
                if (newSchema) {
                  const latestSchemas = toGetSchemasResponse([
                    ...schemas.filter((schema) => schema.id !== newSchema.id),
                    newSchema,
                  ]);
                  addNotification({ message: 'Successfully updated schema', severity: 'success' });
                  await mutate(latestSchemas, {
                    optimisticData: latestSchemas,
                    revalidate: false,
                    populateCache: false,
                  });
                }
                setIsSaving(false);
                setIsDirty(false);
                router.back();
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
