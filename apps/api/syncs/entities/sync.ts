// TODO: Should be shared. Consider putting all entities in same directory.
type SalesforceObject =
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

type SalesforceCustomerIntegrationParams = {
  // If the developer allows the salesforce object to be selectable by the customer,
  // this should be set. Otherwise, it should not.
  // TODO: We may want to spend some time thinking about how to generalize this for all settings
  // between `SyncConfig` and `Sync`.
  object?: SalesforceObject;

  // Tell Supaglue not to call the Salesforce API if customer is at more than this percentage
  // of their daily API quota.
  // TODO: We need to define another level of abstraction later if we want to do
  // triggered syncs and not just syncs periodically run on a schedule.
  apiUsageLimitPercentage?: number; // e.g. 0.8
};

type SalesforceCustomerSourceParams = SalesforceCustomerIntegrationParams;
type CustomerSourceParams = SalesforceCustomerSourceParams;

type SalesforceCustomerDestinationParams = SalesforceCustomerIntegrationParams;
type CustomerDestinationParams = SalesforceCustomerDestinationParams;

type BaseSyncUpdateParams = {
  // TODO: Consider moving `enabled` elsewhere when/if we allow syncs to be triggered.
  enabled: boolean;
  syncConfigName: string;
  fieldMapping?: Record<string, string>;
  // Customer-defined fields that are not included in the developer's destination schema
  customProperties?: Record<string, string>[];
};

type BaseSyncCreateParams = BaseSyncUpdateParams & {
  customerId: string;
};

type BaseSync = BaseSyncCreateParams & {
  id: string;
};

type InboundSyncCore = { type: 'inbound'; source?: CustomerSourceParams };
export type InboundSyncUpdateParams = BaseSyncUpdateParams & InboundSyncCore;
export type InboundSyncCreateParams = BaseSyncCreateParams & InboundSyncCore;
export type InboundSync = BaseSync & InboundSyncCore;

type OutboundSyncCore = { type: 'outbound'; destination?: CustomerDestinationParams };
export type OutboundSyncUpdateParams = BaseSyncUpdateParams & OutboundSyncCore;
export type OutboundSyncCreateParams = BaseSyncCreateParams & OutboundSyncCore;
export type OutboundSync = BaseSync & OutboundSyncCore;

export type SyncUpdateParams = InboundSyncUpdateParams | OutboundSyncUpdateParams;
export type SyncCreateParams = InboundSyncCreateParams | OutboundSyncCreateParams;
export type Sync = InboundSync | OutboundSync;
