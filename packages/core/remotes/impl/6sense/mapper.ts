import type { PersonEnrichmentData } from '@supaglue/types/enrichment/person_enrichment_data';

export type LeadScoringAndFirmographicsResponse = {
  company: {
    name: string | null;
    domain: string | null;
    industry: string | null;
    annualRevenue: string | null;
    employeeCount: string | null;
  } | null;
};

export const from6SenseLeadScoringAndFirmographicsResponseToPersonEnrichmentData = (
  response: LeadScoringAndFirmographicsResponse
): PersonEnrichmentData => {
  if (!response.company) {
    throw new Error('6sense could not enrich person with company info');
  }

  return {
    company: {
      name: response.company.name ?? null,
      industry: response.company.industry ?? null,
      annual_revenue: response.company.annualRevenue ? parseInt(response.company.annualRevenue) : null,
      domain: response.company.domain ?? null,
      employee_count: response.company.employeeCount ? parseInt(response.company.employeeCount) : null,
    },
  };
};
