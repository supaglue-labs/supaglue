export const SUPPORTED_ENRICHMENT_PROVIDERS = ['clearbit', '6sense'] as const;

export type EnrichmentProviderName = (typeof SUPPORTED_ENRICHMENT_PROVIDERS)[number];
export type EnrichmentProviderCategory = 'enrichment';
