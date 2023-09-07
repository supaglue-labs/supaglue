export const SUPPORTED_MARKETING_AUTOMATION_PROVIDERS = [
  'marketo',
  'salesforce_marketing_cloud_account_engagement',
  'hubspot',
] as const;

export type MarketingAutomationProviderName = (typeof SUPPORTED_MARKETING_AUTOMATION_PROVIDERS)[number];
export type MarketingAutomationProviderCategory = 'marketing_automation';

export const MARKETING_AUTOMATION_COMMON_OBJECT_TYPES = ['form', 'activity', 'campaign', 'lead'];

export type MarketingAutmationCommonObjectType = (typeof MARKETING_AUTOMATION_COMMON_OBJECT_TYPES)[number];

// export type MarketingAutomationCommonObjectTypeMap<T extends MarketingAutmationCommonObjectType> = {
//   form: RemoteFormTypes;
//   activity: RemoteActivityTypes;
//   campaign: RemoteCampaignTypes;
//   lead: RemoteLeadTypes;
// }[T];
