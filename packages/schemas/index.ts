import type { components } from './gen/v2/crm'; // just need to get it from somewhere
export * from './supaglue-client';
export type ResponseErrors = components['schemas']['errors'];
export type ResponseWarnings = components['schemas']['warnings'];
