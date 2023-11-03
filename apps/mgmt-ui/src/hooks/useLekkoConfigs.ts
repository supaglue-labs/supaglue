import type { EntitiesWhitelist, SchemasWhitelist } from '@/utils/lekko';
import useSWR from 'swr';
import { fetcher } from '.';

export function useLekkoConfigs() {
  const { data, error, isLoading, ...rest } = useSWR(
    `/api/internal/lekko`,
    fetcher<{ entitiesWhitelistConfig: EntitiesWhitelist; schemasWhitelistConfig: SchemasWhitelist }>
  );

  return {
    entitiesWhitelistConfig: data?.entitiesWhitelistConfig || { applicationIds: [] },
    schemasWhitelistConfig: data?.schemasWhitelistConfig || { applicationIds: [] },
    isLoading,
    error,
    ...rest,
  };
}
