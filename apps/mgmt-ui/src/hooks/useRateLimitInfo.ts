import type { GetRateLimitInfoResponse } from '@supaglue/schemas/v2/mgmt';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useRateLimitInfo(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<GetRateLimitInfoResponse>(
    `/api/internal/rate-limit-info?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    rateLimitInfo: data,
    ...rest,
  };
}
