import Select from '@/components/Select';
import { SwitchWithLabel } from '@/components/SwitchWithLabel';
import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import type { SyncStrategyType } from '@supaglue/types/sync';

const isSyncPeriodSecsValid = (syncPeriodSecs: number | undefined, allowUndefined = false) => {
  if (allowUndefined && syncPeriodSecs === undefined) {
    return true;
  }
  if (!syncPeriodSecs) {
    return false;
  }
  return syncPeriodSecs < 60 ? false : true;
};

type SyncStrategyConfigSectionProps = {
  syncPeriodSecs?: number;
  setSyncPeriodSecs: (value: number | undefined) => void;
  strategy?: SyncStrategyType;
  setStrategy: (value: SyncStrategyType) => void;
  fullSyncEveryNIncrementals?: number;
  setFullSyncEveryNIncrementals: (value: number | undefined) => void;
  autoStartOnConnection: boolean;
  setAutoStartOnConnection: (value: boolean) => void;
  isLoading: boolean;
  isOverride?: boolean;
  disabled?: boolean;
};

export const SyncStrategyConfigSection = ({
  syncPeriodSecs,
  setSyncPeriodSecs,
  strategy,
  setStrategy,
  fullSyncEveryNIncrementals,
  setFullSyncEveryNIncrementals,
  autoStartOnConnection,
  setAutoStartOnConnection,
  isLoading,
  disabled = false,
  isOverride = false,
}: SyncStrategyConfigSectionProps) => {
  return (
    <>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Sync frequency</Typography>
        <TextField
          value={syncPeriodSecs}
          size="small"
          label={`Sync every (in seconds). ${isOverride ? 'If left empty, we will inherit from above.' : ''}`}
          variant="outlined"
          disabled={disabled}
          type="number"
          helperText={`Value needs to be 60 seconds or greater. ${
            isOverride ? 'If left empty, we will inherit from above.' : ''
          }`}
          error={!isSyncPeriodSecsValid(syncPeriodSecs, /* allowUndefined */ isOverride)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            let value: number | undefined = parseInt(event.target.value, 10);
            if (Number.isNaN(value)) {
              value = undefined;
            }
            setSyncPeriodSecs(value);
          }}
        />
      </Stack>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Sync Strategy</Typography>
        <Select
          name={isOverride ? 'Inherit from above' : 'Sync Strategy'}
          disabled={isLoading || disabled}
          onChange={(value) => setStrategy(value as SyncStrategyType)}
          value={strategy ?? ''}
          unselect
          options={[
            {
              value: 'full then incremental',
              displayValue: 'Incremental',
            },
            {
              value: 'full only',
              displayValue: 'Full',
            },
          ]}
        />
        <FormHelperText sx={{ marginY: 0, marginLeft: '14px' }}>
          For Incremental: we will use this strategy when available for the provider and object otherwise we will use
          full sync. Please refer to provider docs for more details.
        </FormHelperText>
        {strategy === 'full then incremental' && (
          <>
            <Typography variant="subtitle1">Incremental with a periodic full sync</Typography>
            <TextField
              value={fullSyncEveryNIncrementals}
              disabled={disabled}
              size="small"
              label="Incremental with a periodic full sync"
              variant="outlined"
              type="number"
              helperText="Enter the number of successful incremental syncs before running a full sync. (All values < 1 will be taken to mean 'never'.)"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                let value: number | undefined = parseInt(event.target.value, 10);
                if (Number.isNaN(value) || value < 1) {
                  value = undefined;
                }
                setFullSyncEveryNIncrementals(value);
              }}
            />
          </>
        )}
      </Stack>
      <Stack className="gap-2">
        <SwitchWithLabel
          label="Start Sync on Connection"
          disabled={disabled}
          isLoading={isLoading}
          checked={autoStartOnConnection}
          onToggle={setAutoStartOnConnection}
        />
      </Stack>
    </>
  );
};
