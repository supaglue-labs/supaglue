import z from 'zod';
import { createDocument, extendZodWithOpenApi } from 'zod-openapi';
import { jsonOperation } from '../../utils/integration-utils';

extendZodWithOpenApi(z);

/**
 * TODO: type the string validation better. This is technically an enum of 'loading' values
 * for some reason, but there's no clear documentation on what these can be.
 */
export const apolloMetric = z
  .union([z.number(), z.literal('loading')])
  .nullish()
  .openapi({ ref: 'metric' });

/** aka Sequence */
export type ApolloEmailerCampaign = z.infer<typeof apolloEmailerCampaign>;
export const apolloEmailerCampaign = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    created_at: z.string().datetime(),
    permissions: z.enum(['team_can_use', 'team_can_view', 'private']).optional(),
    active: z.boolean(),
    archived: z.boolean(),
    label_ids: z.array(z.string()),
    num_steps: z.number().nullish(),
    user_id: z.string().nullish(),
    unique_scheduled: apolloMetric,
    unique_delivered: apolloMetric,
    unique_bounced: apolloMetric,
    unique_opened: apolloMetric,
    unique_replied: apolloMetric,
    unique_demoed: apolloMetric,
    unique_clicked: apolloMetric,
    unique_unsubscribed: apolloMetric,
    bounce_rate: apolloMetric,
    open_rate: apolloMetric,
    click_rate: apolloMetric,
    reply_rate: apolloMetric,
    spam_blocked_rate: apolloMetric,
    opt_out_rate: apolloMetric,
    demo_rate: apolloMetric,
  })
  .openapi({ ref: 'emailer_campaign' });

/** Aka CreateSequence */
export type ApolloCreateEmailerCampaign = z.infer<typeof apolloCreateEmailerCampaign>;
export const apolloCreateEmailerCampaign = apolloEmailerCampaign.partial().pick({
  creation_type: true,
  name: true,
  permissions: true,
  user_id: true,
  label_ids: true,
  active: true,
});

export type ApolloEmailerCampaignAddContactIds = z.infer<typeof apolloEmailerCampaignAddContactIds>;
export const apolloEmailerCampaignAddContactIds = z.object({
  contact_ids: z.array(z.string()),
  emailer_campaign_id: z.string(),
  send_email_from_email_account_id: z.string(),
  userId: z.string().nullish(),
  sequence_active_in_other_campaigns: z.boolean().optional().describe(`
    By default Apollo will not add contact to more than one sequence at a time. However if we pass "true"
    to this field, it will add the contact to the sequence even if they are already in another sequence.
  `),
});

export type ApolloContact = z.infer<typeof apolloContact>;
export const apolloContact = z
  .object({
    id: z.string(),
    emailer_campaign_ids: z.array(z.string()).optional(),
    contact_campaign_statuses: z.array(
      z
        .object({
          id: z.string(),
          send_email_from_email_account_id: z.string(),
          emailer_campaign_id: z.string(),
        })
        .passthrough()
    ),
  })
  .passthrough()
  .openapi({ ref: 'contact' });

export type ApolloEmailerCampaignAddContactIdsResponse = z.infer<typeof apolloEmailerCampaignAddContactIdsResponse>;
export const apolloEmailerCampaignAddContactIdsResponse = z.object({ contacts: z.array(apolloContact) }).passthrough();

/** Aka SequenceStep */
export type ApolloEmailerStep = z.infer<typeof apolloEmailerStep>;
export const apolloEmailerStep = z
  .object({
    id: z.string(),
    emailer_campaign_id: z.string(),
    position: z.number().nullish(),
    wait_time: z.number().nullish(),
    type: z
      .enum([
        'auto_email',
        'manual_email',
        'call',
        'action_item',
        'linkedin_step_message',
        'linkedin_step_connect',
        'linkedin_step_view_profile',
        'linkedin_step_interact_post',
      ])
      .openapi({ ref: 'emailer_step_type' }),
    wait_mode: z.enum(['second', 'minute', 'hour', 'day']).openapi({ ref: 'emailer_step_wait_mode' }),
    note: z.string().nullish(),
    max_emails_per_day: z.number().nullish(),
    exact_datetime: z.string().nullish(),
    priority: z.string().nullish(),
    auto_skip_in_x_days: z.number().nullish(),
    counts: z
      .object({
        active: z.number().nullish(),
        paused: z.number().nullish(),
        finished: z.number().nullish(),
        bounced: z.number().nullish(),
        spam_blocked: z.number().nullish(),
        hard_bounced: z.number().nullish(),
        not_sent: z.number().nullish(),
      })
      .nullish(),
  })
  .openapi({ ref: 'emailer_step' });

export type ApolloCreateEmailerStep = z.infer<typeof apolloCreateEmailerStep>;
export const apolloCreateEmailerStep = apolloEmailerStep.pick({
  emailer_campaign_id: true,
  priority: true,
  /** Doesn't work if already taken */
  position: true,
  type: true,
  wait_mode: true,
  wait_time: true,
  exact_datetime: true,
  note: true,
});

/** aka EmailTemplate */
export type ApolloEmailerTemplate = z.infer<typeof apolloEmailerTemplate>;
export const apolloEmailerTemplate = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    user_id: z.string().nullish(),
    subject: z.string().nullish(),
    archived: z.boolean().nullish(),
    created_at: z.string().datetime().nullish(),
    global: z.boolean().nullish(),
    body_text: z.string().nullish(),
    folder_id: z.string().nullish(),
    body_html: z.string().nullish(),
    creation_type: z.string().nullish(),
    label_ids: z.array(z.string()).nullish(),
    prompt_id: z.string().nullish(),
  })
  .openapi({ ref: 'emailer_template' });

/** Aka SequenceTemplate */
export type ApolloEmailerTouch = z.infer<typeof apolloEmailerTouch>;
export const apolloEmailerTouch = z
  .object({
    id: z.string(),
    emailer_step_id: z.string().nullish(),
    emailer_template_id: z.string().nullish(),
    emailer_template: apolloEmailerTemplate.nullish(),
    status: z.string().nullish(),
    type: z.enum(['reply_to_thread', 'new_thread']).nullish(),
    include_signature: z.boolean().nullish(),
    has_personalized_opener: z.boolean().nullish(),
    personalized_opener_fallback_option: z.string().nullish(),
    generic_personalized_opener: z.string().nullish(),
    unique_scheduled: apolloMetric,
    unique_delivered: apolloMetric,
    unique_bounced: apolloMetric,
    unique_opened: apolloMetric,
    unique_replied: apolloMetric,
    bounce_rate: apolloMetric,
    open_rate: apolloMetric,
    reply_rate: apolloMetric,
    demo_rate: apolloMetric,
    unique_demoed: apolloMetric,
    unique_clicked: apolloMetric,
    click_rate: apolloMetric,
    unique_unsubscribed: apolloMetric,
    opt_out_rate: apolloMetric,
    unique_hard_bounced: apolloMetric,
    unique_spam_blocked: apolloMetric,
    hard_bounce_rate: apolloMetric,
    spam_block_rate: apolloMetric,
  })
  .openapi({ ref: 'emailer_touch' });

const emailAccount = z
  .object({
    id: z.string(),
    userId: z.unknown(),
    email: z.unknown(),
    createdAt: z.unknown(),
    updatedAt: z.unknown(),
    lastModifiedAt: z.unknown(),
    isDeleted: z.unknown(),
    rawData: z.unknown(),
    isDisabled: z.unknown(),
  })
  .catchall(z.unknown())
  .openapi({ ref: 'email_account' });

export const apolloEmailerTouchUpdate = apolloEmailerTouch.pick({
  id: true,
  emailer_step_id: true,
  emailer_template: true,
  type: true,
});

export const apolloEmailerCampaignResponse = z.object({
  emailer_campaign: apolloEmailerCampaign,
  emailer_steps: z.array(apolloEmailerStep).nullish(),
  emailer_touches: z.array(apolloEmailerTouch).nullish(),
  emailer_templates: z.array(apolloEmailerTemplate).nullish(),
});

export function outputOpenApi() {
  return createDocument({
    openapi: '3.1.0',
    info: { title: 'Apollo API', version: '0.0.0' },
    servers: [{ url: 'https://app.apollo.io/api' }],
    security: [{ api_key: [] }],
    components: {
      securitySchemes: { api_key: { type: 'apiKey', name: 'api_key', in: 'query' } },
    },
    paths: {
      '/v1/emailer_campaigns/{id}': {
        get: jsonOperation('getEmailerCampaign', {
          path: z.object({ id: z.string() }),
          response: apolloEmailerCampaignResponse,
        }),
      },
      '/v1/emailer_campaigns': {
        post: jsonOperation('createEmailerCampaign', {
          body: apolloCreateEmailerCampaign,
          response: apolloEmailerCampaignResponse,
        }),
      },
      '/v1/emailer_campaigns/{id}/add_contact_ids': {
        post: jsonOperation('addContactIdsToEmailerCampaign', {
          path: z.object({ id: z.string() }),
          body: apolloEmailerCampaignAddContactIds,
          response: apolloEmailerCampaignAddContactIdsResponse,
        }),
      },
      '/v1/emailer_steps': {
        post: jsonOperation('createEmailerStep', {
          body: apolloCreateEmailerStep,
          response: z.object({
            emailer_step: apolloEmailerStep,
            // Null for templatable steps (e.g. tasks / calls)
            emailer_touch: apolloEmailerTouch.nullish(),
            emailer_template: apolloEmailerTemplate.nullish(),
          }),
        }),
      },
      '/v1/emailer_steps/{id}': {
        delete: jsonOperation('deleteEmailerStep', {
          path: z.object({ id: z.string() }),
          response: z.object({ emailer_step: z.object({ id: z.string(), deleted: z.boolean() }) }),
        }),
      },
      '/v1/emailer_touches/{id}': {
        put: jsonOperation('updateEmailerTouch', {
          path: z.object({ id: z.string() }),
          body: apolloEmailerTouchUpdate,
          response: z.object({ emailer_touch: apolloEmailerTouch }),
        }),
      },
      '/v1/contacts/{id}': {
        get: jsonOperation('getContact', {
          path: z.object({ id: z.string() }),
          response: z.object({ contact: apolloContact }),
        }),
      },
      '/v1/email_accounts': {
        get: jsonOperation('listEmailAccounts', {
          response: z.object({ email_accounts: z.array(emailAccount) }),
        }),
      },
      '/v1/emailer_campaigns/check_contacts_deployability': {
        post: jsonOperation('checkContactsDeployability', {
          meta: {
            description:
              'Check if contacts are deployable to a sequence, primarily used to check if contacts are already in another sequence.',
          },
          body: z.object({
            contact_ids: z.array(z.string()),
            emailer_campaign_id: z.string().optional(),
          }),
          response: z.object({
            num_active_in_other_campaigns: z.number(),
            num_finished_in_other_campaigns: z.number(),
            num_same_company: z.number(),
            num_no_email: z.number(),
            num_unverified_email: z.number(),
            num_without_ownership_permission: z.number(),
            num_with_job_change_contacts: z.number(),
            sample_active_in_other_campaigns_contacts: z.array(z.object({ id: z.string(), name: z.string() })),
            sample_finished_in_other_campaigns_contacts: z.array(z.unknown()),
            sample_same_company_contacts: z.array(z.unknown()),
            sample_no_email_contacts: z.array(z.unknown()),
            sample_unverified_email_contacts: z.array(z.unknown()),
            sample_without_ownership_permission: z.array(z.unknown()),
            sample_with_job_change_contacts: z.array(z.unknown()),
            show_warning: z.boolean(),
            num_total_dangerous_contacts: z.number(),
          }),
        }),
      },
    },
  });
}

if (require.main === module) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(outputOpenApi(), null, 2));
}
