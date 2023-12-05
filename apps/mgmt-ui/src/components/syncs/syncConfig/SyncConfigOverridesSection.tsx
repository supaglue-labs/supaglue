import Select from '@/components/Select';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Autocomplete, Box, Button, Chip, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import type { CommonObjectType, SyncStrategyConfig } from '@supaglue/types';
import type { SyncStrategyType } from '@supaglue/types/sync';
import type { CommonObjectConfig, CustomObjectConfig, StandardObjectConfig } from '@supaglue/types/sync_object_config';
import { useEffect, useState } from 'react';
import { SyncStrategyConfigSection } from './SyncStrategyConfigSection';

export type SyncConfigOverrides = {
  common?: CommonObjectConfig[];
  standard?: StandardObjectConfig[];
  custom?: CustomObjectConfig[];
};

type SyncConfigOverridesSectionProps = {
  providerName?: string;
  commonObjects: CommonObjectType[];
  standardObjects: string[];
  customObjects: string[];
  overrides: SyncConfigOverrides;
  defaultConfig: SyncStrategyConfig;
  setOverrides: (overrides: SyncConfigOverrides) => void;
};

type SelectedObject = {
  type: 'common' | 'standard' | 'custom';
  name: string;
};

export const SyncConfigOverridesSection = ({
  providerName,
  commonObjects,
  standardObjects,
  customObjects,
  overrides,
  setOverrides,
  defaultConfig,
}: SyncConfigOverridesSectionProps) => {
  const overridesArray: SelectedObject[] = [
    ...(overrides?.common?.map((c) => ({ type: 'common', name: c.object })) ?? []),
    ...(overrides?.standard?.map((s) => ({ type: 'standard', name: s.object })) ?? []),
    ...(overrides?.custom?.map((c) => ({ type: 'custom', name: c.object })) ?? []),
    { type: 'standard', name: 'Create new override' },
  ] as SelectedObject[];
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | undefined>(
    overridesArray.length > 1 ? overridesArray[0] : undefined
  );

  useEffect(() => {
    if (!selectedObject) {
      return;
    }
    const newTab = overridesArray.findIndex((o) => o.name === selectedObject.name && o.type === selectedObject.type);
    if (newTab !== tab) {
      setTab(newTab);
    }
  }, [selectedObject]);

  const getSelectedObjectValue = (selectedObject?: SelectedObject) =>
    selectedObject ? `${selectedObject.type}:${selectedObject.name}` : '';

  const allGroupedOptions = [
    {
      header: 'Common Objects',
      options: commonObjects.map((obj) => ({ value: `common:${obj}`, displayValue: obj })),
    },
    {
      header: 'Standard Objects',
      options: standardObjects.map((obj) => ({ value: `standard:${obj}`, displayValue: obj })),
    },
    {
      header: 'Custom Objects',
      options: customObjects.map((obj) => ({ value: `custom:${obj}`, displayValue: obj })),
    },
  ].filter((group) => group.options.length);

  // Filter grouped options to remove already existing overrides
  const filteredGroupedOptions = [
    {
      header: 'Common Objects',
      options: commonObjects
        .filter((obj) => !overrides.common?.find((o) => o.object === obj))
        .map((obj) => ({ value: `common:${obj}`, displayValue: obj })),
    },
    {
      header: 'Standard Objects',
      options: standardObjects
        .filter((obj) => !overrides.standard?.find((o) => o.object === obj))
        .map((obj) => ({ value: `standard:${obj}`, displayValue: obj })),
    },
    {
      header: 'Custom Objects',
      options: customObjects
        .filter((obj) => !overrides.custom?.find((o) => o.object === obj))
        .map((obj) => ({ value: `custom:${obj}`, displayValue: obj })),
    },
  ].filter((group) => group.options.length);

  const override = selectedObject
    ? overrides[selectedObject.type]?.find((o) => o.object === selectedObject?.name)
    : undefined;

  const syncPeriodSecs = override?.syncStrategyOverride?.periodMs
    ? override?.syncStrategyOverride?.periodMs / 1000
    : undefined;

  const strategy = override?.syncStrategyOverride?.strategy;

  const fullSyncEveryNIncrementals = override?.syncStrategyOverride?.fullSyncEveryNIncrementals;

  const autoStartOnConnection =
    override?.syncStrategyOverride?.autoStartOnConnection ?? defaultConfig.autoStartOnConnection ?? true;

  const associationsToFetch = override?.associationsToFetch ?? [];

  const setSyncPeriodSecs = (value: number | undefined): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
        {
          object: selectedObject.name,
          syncStrategyOverride: {
            ...(override?.syncStrategyOverride ?? {}),
            periodMs: value ? value * 1000 : undefined,
          },
        },
      ],
    });
  };

  const setStrategy = (value: SyncStrategyType): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
        {
          object: selectedObject.name,
          syncStrategyOverride: {
            ...(override?.syncStrategyOverride ?? {}),
            strategy: value,
          },
        },
      ],
    });
  };

  const setFullSyncEveryNIncrementals = (value: number | undefined): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
        {
          object: selectedObject.name,
          syncStrategyOverride: {
            ...(override?.syncStrategyOverride ?? {}),
            fullSyncEveryNIncrementals: value,
          },
        },
      ],
    });
  };

  const setAutoStartOnConnection = (value: boolean): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
        {
          object: selectedObject.name,
          syncStrategyOverride: {
            ...(override?.syncStrategyOverride ?? {}),
            autoStartOnConnection: value,
          },
        },
      ],
    });
  };

  const setAssociationsToFetch = (value: string[]): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
        {
          object: selectedObject.name,
          associationsToFetch: value,
        },
      ],
    });
  };

  const deleteOverride = (selectedObject?: SelectedObject): void => {
    if (!selectedObject) {
      return;
    }
    setOverrides({
      ...overrides,
      [selectedObject.type]: (overrides[selectedObject.type] ?? []).filter((o) => o.object !== selectedObject.name),
    });
    setTab(0);
    setSelectedObject(overridesArray.length > 1 ? overridesArray[0] : undefined);
  };

  const addEmptyOverride = (selectedObject: SelectedObject): void => {
    setOverrides({
      ...overrides,
      [selectedObject.type]: [
        ...(overrides[selectedObject.type] ?? []),
        {
          object: selectedObject.name,
        },
      ],
    });
  };

  return (
    <div className="bg-sky-50 rounded-xl">
      <Button className="flex flex-row justify-start gap-2" variant="text" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ExpandLess /> : <ExpandMore />}
        <span>Object overrides</span>
        <Tooltip
          title="Configure any object-specific overrides for your sync. If no override is configured for an object, the
            default sync config (above) will be used for that object."
        >
          <InfoOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.6);' }} />
        </Tooltip>
      </Button>
      {expanded && (
        <div className="p-4 rounded-xl">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab}>
              {overridesArray.map((override, idx) => (
                <Tab
                  key={idx}
                  label={override.name}
                  onClick={() => {
                    if (idx === overridesArray.length - 1) {
                      setSelectedObject(undefined);
                    } else {
                      setSelectedObject(overridesArray[idx]);
                    }
                    setTab(idx);
                  }}
                />
              ))}
            </Tabs>
          </Box>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Select Object</Typography>
            <Select
              name="Select Object"
              disabled={!!selectedObject}
              onChange={(value) => {
                if (!value) {
                  return;
                }
                const [type, name] = value.split(':');
                const selected = { type: type as 'common' | 'standard' | 'custom', name };
                setSelectedObject(selected);
                addEmptyOverride(selected);
              }}
              value={getSelectedObjectValue(selectedObject)}
              groupedOptions={selectedObject ? allGroupedOptions : filteredGroupedOptions}
              isGrouped
            />
          </Stack>
          <SyncStrategyConfigSection
            key={getSelectedObjectValue(selectedObject)}
            syncPeriodSecs={syncPeriodSecs}
            setSyncPeriodSecs={setSyncPeriodSecs}
            strategy={strategy}
            setStrategy={setStrategy}
            fullSyncEveryNIncrementals={fullSyncEveryNIncrementals}
            setFullSyncEveryNIncrementals={setFullSyncEveryNIncrementals}
            autoStartOnConnection={autoStartOnConnection}
            setAutoStartOnConnection={setAutoStartOnConnection}
            isLoading={false}
            isOverride
            disabled={!selectedObject}
          />
          {providerName === 'hubspot' && (
            <AssociationsToFetch
              associationsToFetch={associationsToFetch}
              setAssociationsToFetch={setAssociationsToFetch}
              disabled={!selectedObject}
              options={[...commonObjects, ...standardObjects, ...customObjects]}
            />
          )}
          <Button
            variant="contained"
            className="mt-4"
            color="error"
            disabled={!selectedObject}
            onClick={() => deleteOverride(selectedObject)}
          >
            Delete Override
          </Button>
        </div>
      )}
    </div>
  );
};

type AssociationsToFetchProps = {
  associationsToFetch: string[];
  setAssociationsToFetch: (value: string[]) => void;
  disabled?: boolean;
  options: string[];
};

const AssociationsToFetch = ({
  associationsToFetch,
  setAssociationsToFetch,
  options,
  disabled,
}: AssociationsToFetchProps) => {
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <Stack className="gap-2">
      <Typography variant="subtitle1">Associations to Fetch</Typography>
      <Autocomplete
        size="small"
        multiple
        id="standard-objects"
        disabled={disabled}
        options={options}
        value={associationsToFetch}
        inputValue={inputValue}
        autoSelect
        freeSolo
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        onInputChange={(event, newInputValue) => {
          if (newInputValue.endsWith(',')) {
            const newObject = newInputValue.slice(0, -1).trim();
            if (newObject) {
              setAssociationsToFetch([...associationsToFetch, newObject]);
            }
            setInputValue('');
            return;
          }
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Associations to Fetch"
            helperText={`List of associated object types to fetch. (Note: names are case-sensitive. Press enter or comma to add multiple fields.)`}
          />
        )}
        onChange={(event: any, value: string[]) => {
          setAssociationsToFetch(value.map((v) => v.trim()));
        }}
      />
    </Stack>
  );
};
