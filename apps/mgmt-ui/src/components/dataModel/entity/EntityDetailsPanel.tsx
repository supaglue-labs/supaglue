/* eslint-disable @typescript-eslint/no-floating-promises */
import { createEntity, updateEntity } from '@/client';
import Spinner from '@/components/Spinner';
import { SwitchWithLabel } from '@/components/SwitchWithLabel';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { toGetEntitiesResponse, useEntities } from '@/hooks/useEntities';
import { Autocomplete, Breadcrumbs, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { Entity, EntityCreateParams } from '@supaglue/types/entity';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function EntityDetailsPanel({ entityId }: { entityId: string }) {
  return <EntityDetailsPanelImpl entityId={entityId} />;
}

export function NewEntityPanel() {
  return <EntityDetailsPanelImpl />;
}

type EntityDetailsPanelImplProps = {
  entityId?: string;
};

function EntityDetailsPanelImpl({ entityId }: EntityDetailsPanelImplProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { entities = [], isLoading, mutate } = useEntities();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [fields, setFields] = useState<string[]>([]);
  const [allowAdditionalFieldMappings, setAllowAdditionalFieldMappings] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const router = useRouter();

  const isNameValid = name && name.match(/^[a-zA-Z0-9_]+$/);

  const isFormValid = isNameValid && fields.length > 0;

  const entity = entities.find((s) => s.id === entityId);

  useEffect(() => {
    setFields(entity?.config.fields.map((field) => field.name) ?? []);
    setName(entity?.name ?? undefined);
    setAllowAdditionalFieldMappings(entity?.config.allowAdditionalFieldMappings ?? false);
  }, [entity?.id]);

  if (isLoading) {
    return <Spinner />;
  }

  const formTitle = entity ? 'Edit Entity' : 'New Entity';
  const isNew = !entity?.id;

  const createOrUpdateEntity = async (): Promise<Entity | undefined> => {
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

    if (entity) {
      const newEntity: Entity = {
        ...entity,
        name,
        config: {
          allowAdditionalFieldMappings,
          fields: fields.map((field) => ({ name: field })),
        },
      };
      const response = await updateEntity(activeApplicationId, newEntity);
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }

    // create path
    const newEntity: EntityCreateParams = {
      applicationId: activeApplicationId,
      name,
      config: {
        allowAdditionalFieldMappings,
        fields: fields.map((field) => ({ name: field })),
      },
    };
    const response = await createEntity(activeApplicationId, newEntity);
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
          <Typography color="text.primary">Entities</Typography>
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
              error={(!isNew && name === '') || (!!name && !isNameValid)}
              value={name}
              size="small"
              label="Name (must be unique)"
              variant="outlined"
              helperText="Must only contain alphanumeric characters and underscores"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setName(event.target.value);
                setIsDirty(true);
              }}
            />
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Fields</Typography>
            <Autocomplete
              disabled={isLoading || isSaving}
              key={entity?.name}
              size="small"
              multiple
              id="fields"
              options={[]}
              defaultValue={entity?.config.fields.map((field) => field.name) ?? []}
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
                  helperText={`Enter entity fields here. (Note: names are case-sensitive. Use "enter" to add multiple fields.)`}
                />
              )}
              onChange={(event: any, value: string[]) => {
                setFields(value.map((v) => v.trim()));
                setIsDirty(true);
              }}
            />
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
                const newEntity = await createOrUpdateEntity();
                if (newEntity) {
                  const latestEntities = toGetEntitiesResponse([
                    ...entities.filter((entity) => entity.id !== newEntity.id),
                    newEntity,
                  ]);
                  addNotification({ message: 'Successfully updated entity', severity: 'success' });
                  await mutate(latestEntities, {
                    optimisticData: latestEntities,
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
