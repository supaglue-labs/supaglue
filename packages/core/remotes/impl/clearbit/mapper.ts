import type { EnrichedCompany } from '@supaglue/types/enrichment/enriched_company';
import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';

export type CombinedAPIResponse = {
  company: ClearbitCompany | null;
};

export type ClearbitCompany = {
  name: string | null;
  domain: string | null;
  category: {
    industry: string | null;
  } | null;
  metrics: {
    annualRevenue: number | null;
    employees: number | null;
  };
};

export const fromClearbitCombinedAPIResponseToPersonEnrichmentData = (
  record: CombinedAPIResponse
): PersonEnrichmentData => {
  if (!record.company) {
    throw new Error('Clearbit could not enrich person with company info');
  }

  return {
    company: fromClearbitCompanyToEnrichedCompany(record.company),
  };
};

export const fromClearbitCompanyToEnrichedCompany = (record: ClearbitCompany): EnrichedCompany => {
  return {
    name: record.name ?? null,
    industry: record.category?.industry ?? null,
    annual_revenue: record.metrics?.annualRevenue ?? null,
    domain: record.domain ?? null,
    employee_count: record.metrics?.employees ?? null,
  };
};
