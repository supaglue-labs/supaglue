export type Field = {
  name: string; // Raw field name.
  label?: string; // Human-readable label to be displayed to customers.
  description?: string;
  required?: boolean; // Defaults to false.
};

export type Schema = {
  fields: Field[];
};

type BaseInternalIntegration = {
  schema: Schema;

  // TODO: Need to properly figure out where to put this abstraction when we spend more time on
  // IntegrationSDK and retries/rate limits.
  retryPolicy?: RetryPolicy;
};

export type RetryPolicy = {
  // TODO: more customization
  retries?: number;
};

export type PostgresCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
    customPropertiesColumn?: string; // NOTE: This must be a jsonb column on the same table
  };
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type WebhookInternalIntegration = BaseInternalIntegration & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType; // GET, POST, etc.
    headers?: string | string[]; // Authorization header etc.
  };
};

export type PostgresDestination = PostgresInternalIntegration & {
  config: {
    upsertKey: string;
  };
};

export type WebhookDestination = WebhookInternalIntegration;

export type InternalDestination = PostgresDestination | WebhookDestination;

export type PostgresSource = PostgresInternalIntegration;

export type InternalSource = PostgresSource;

export type FieldMapping = {
  name: string;
  field: string;
};

export type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

export type SalesforceObject =
  | 'Account'
  | 'Activity'
  | 'AlternativePaymentMethod'
  | 'ApiAnomalyEventStore'
  | 'AppointmentInvitation'
  | 'AppointmentInvitee'
  | 'AppointmentTopicTimeSlot'
  | 'Asset'
  | 'AssetAction'
  | 'AssetActionSource'
  | 'AssetRelationship'
  | 'AssetStatePeriod'
  | 'AssignedResource'
  | 'AssociatedLocation'
  | 'AuthorizationForm'
  | 'AuthorizationFormConsent'
  | 'AuthorizationFormDataUse'
  | 'AuthorizationFormText'
  | 'BusinessBrand'
  | 'Campaign'
  | 'CampaignMember'
  | 'CardPaymentMethod'
  | 'WebCart'
  | 'WebCartAdjustmentBasis'
  | 'WebCartAdjustmentGroup'
  | 'CartDeliveryGroup'
  | 'CartItem'
  | 'CartItemPriceAdjustment'
  | 'CartTax'
  | 'Case'
  | 'CaseRelatedIssue'
  | 'ChangeRequest'
  | 'ChangeRequestRelatedIssue'
  | 'ChangeRequestRelatedItem'
  | 'CommSubscription'
  | 'CommSubscriptionChannelType'
  | 'CommSubscriptionConsent'
  | 'CommSubscriptionTiming'
  | 'ConsumptionRate'
  | 'ConsumptionSchedule'
  | 'Contact'
  | 'ContactPointAddress'
  | 'ContactPointConsent'
  | 'ContactPointEmail'
  | 'ContactPointPhone'
  | 'ContactPointTypeConsent'
  | 'ContactRequest'
  | 'ContentVersion'
  | 'Contract'
  | 'ContractLineItem'
  | 'Coupon'
  | 'CredentialStuffingEventStore'
  | 'CreditMemo'
  | 'CreditMemoInvApplication'
  | 'CreditMemoLine'
  | 'Customer'
  | 'DandBCompany'
  | 'DataUseLegalBasis'
  | 'DataUsePurpose'
  | 'DigitalWallet'
  | 'DuplicateRecordItem'
  | 'DuplicateRecordSet'
  | 'EmailMessage'
  | 'EngagementChannelType'
  | 'EngagementChannelWorkType'
  | 'Entitlement'
  | 'EntitlementContact'
  | 'Event'
  | 'FinanceBalanceSnapshot'
  | 'FinanceTransaction'
  | 'Image'
  | 'Incident'
  | 'IncidentRelatedItem'
  | 'Individual'
  | 'Invoice'
  | 'InvoiceLine'
  | 'Lead'
  | 'LegalEntity'
  | 'ListEmail'
  | 'Location'
  | 'LocationGroup'
  | 'LocationGroupAssignment'
  | 'Macro'
  | 'MessagingSession'
  | 'MessagingEndUser'
  | 'EntityMilestone'
  | 'OperatingHours'
  | 'OperatingHoursHoliday'
  | 'Opportunity'
  | 'OpportunityContactRole'
  | 'OpportunityLineItem'
  | 'Order'
  | 'OrderItem'
  | 'PartyConsent'
  | 'Payment'
  | 'PaymentAuthorization'
  | 'PaymentAuthAdjustment'
  | 'PaymentGateway'
  | 'PaymentGroup'
  | 'PaymentLineInvoice'
  | 'Pricebook2'
  | 'PricebookEntry'
  | 'Problem'
  | 'ProblemRelatedItem'
  | 'ProcessException'
  | 'Product2'
  | 'ProductAttribute'
  | 'ProductAttributeSetProduct'
  | 'ProductConsumptionSchedule'
  | 'Promotion'
  | 'PromotionMarketSegment'
  | 'PromotionQualifier'
  | 'PromotionSegment'
  | 'PromotionSegmentSalesStore'
  | 'PromotionTarget'
  | 'LocationWaitlist'
  | 'LocWaitlistMsgTemplate'
  | 'LocationWaitlistedParty'
  | 'QuickText'
  | 'Recommendation'
  | 'Refund'
  | 'RefundLinePayment'
  | 'ProblemIncident'
  | 'ReportAnomalyEventStore'
  | 'ResourceAbsence'
  | 'ResourcePreference'
  | 'ReturnOrder'
  | 'ReturnOrderItemAdjustment'
  | 'ReturnOrderItemTax'
  | 'ReturnOrderLineItem'
  | 'Scorecard'
  | 'ScorecardAssociation'
  | 'ScorecardMetric'
  | 'Seller'
  | 'ServiceAppointment'
  | 'ServiceAppointmentGroup'
  | 'ServiceContract'
  | 'ServiceResource'
  | 'ServiceResourceSkill'
  | 'ServiceTerritory'
  | 'ServiceTerritoryMember'
  | 'ServiceTerritoryRelationship'
  | 'ServiceTerritoryWorkType'
  | 'SessionHijackingEventStore'
  | 'Shift'
  | 'ShiftEngagementChannel'
  | 'ShiftWorkTopic'
  | 'SkillRequirement'
  | 'SocialPersona'
  | 'WebStore'
  | 'Task'
  | 'TimeSlot'
  | 'User'
  | 'UserProvisioningRequest'
  | 'VoiceCall'
  | 'WorkOrder'
  | 'WorkOrderLineItem'
  | 'WorkPlan'
  | 'WorkPlanTemplate'
  | 'WorkPlanTemplateEntry'
  | 'WorkProcedure'
  | 'WorkProcedureStep'
  | 'WorkStep'
  | 'WorkStepTemplate'
  | 'WorkType'
  | 'WorkTypeExtension'
  | 'WorkTypeGroup'
  | 'WorkTypeGroupMember';

export type SalesforceRateLimitConfig = {
  batchAllocationPerHour?: number; // max: 15,000/24 hours = 625/hour
  concurrentApiRequest?: number; // max:: developer: 5, production: 25
  apiRequestAllocation?: number; // max: 100K + (number license x license type)
};

type SalesforceFetchConfig = {
  strategy: 'full_refresh' | 'incremental';
  watermarkField: 'LastModifiedDate';
  batchSize: number;
  rateLimitConfig?: SalesforceRateLimitConfig;
};

// Developer specifies the Salesforce sObject
export type SpecifiedSalesforceObjectConfig = {
  type: 'specified';
  object: SalesforceObject;
};

// Developer expects the customer to choose from a list of
// Salesforce sObject choices.
export type SelectableSalesforceObjectConfig = {
  type: 'selectable';
  objectChoices: SalesforceObject[];
};

export type SalesforceObjectConfig = SpecifiedSalesforceObjectConfig | SelectableSalesforceObjectConfig;

export type BaseCustomerIntegration = object;

export type SalesforceCustomerIntegration = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
  fetchConfig?: SalesforceFetchConfig;
};

export type SalesforceSource = SalesforceCustomerIntegration;

export type CustomerSource = SalesforceSource;

export type SalesforceDestination = SalesforceCustomerIntegration & {
  upsertKey: string; // ext_id
};

export type CustomerDestination = SalesforceDestination;

export type BasePeriodicSyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)

  // some valid cron string
  // TODO: we'll want to allow triggered sync runs down the line
  cronExpression: string;

  // TODO: support incremental
  strategy: 'full_refresh';

  defaultFieldMapping?: FieldMapping[];
};

export type BaseRealtimeSyncConfig = Omit<BasePeriodicSyncConfig, 'cronExpression' | 'strategy'>;

export type InboundSyncConfig = BasePeriodicSyncConfig & {
  type: 'inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

export type OutboundSyncConfig = BasePeriodicSyncConfig & {
  type: 'outbound';
  source: InternalSource;
  destination: CustomerDestination;
};

export type RealtimeInboundSyncConfig = BaseRealtimeSyncConfig & {
  type: 'realtime_inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

export type SyncConfig = InboundSyncConfig | OutboundSyncConfig | RealtimeInboundSyncConfig;

export type DeveloperConfigSpec = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};
