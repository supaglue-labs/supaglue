import { extendApi } from '@anatine/zod-openapi';
import { Zodios } from '@zodios/core';
import type { AxiosRequestConfig } from 'axios';
import z from 'zod';
import { defineApi } from '../../utils/zodios-api-shorthand';

/**
 * TODO: type the string validation better. This is technically an enum of 'loading' values
 * for some reason, but there's no clear documentation on what these can be.
 */
export const apolloMetric = z.union([z.number(), z.literal('loading')]).nullish();

/** aka Sequence */
export type ApolloEmailerCampaign = z.infer<typeof apolloEmailerCampaign>;
export const apolloEmailerCampaign = extendApi(
  z.object({
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
  }),
  { example: require('./examples/emailer-campaign.example.json') }
);

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

/** Aka SequenceStep */
export type ApolloEmailerStep = z.infer<typeof apolloEmailerStep>;
export const apolloEmailerStep = z.object({
  id: z.string(),
  emailer_campaign_id: z.string(),
  position: z.number().nullish(),
  wait_time: z.number().nullish(),

  type: z.enum([
    'auto_email',
    'manual_email',
    'call',
    'action_item',
    'linkedin_step_message',
    'linkedin_step_connect',
    'linkedin_step_view_profile',
    'linkedin_step_interact_post',
  ]),
  wait_mode: z.enum(['second', 'minute', 'hour', 'day']),
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
});

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
export const apolloEmailerTemplate = z.object({
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
});

/** Aka SequenceTemplate */
export type ApolloEmailerTouch = z.infer<typeof apolloEmailerTouch>;
export const apolloEmailerTouch = z.object({
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
});

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

export const apolloApi = defineApi({
  'GET EmailerCampaign': {
    path: '/v1/emailer_campaigns/:id',
    response: apolloEmailerCampaignResponse,
  },
  'POST EmailerCampaign': {
    path: '/v1/emailer_campaigns',
    body: apolloCreateEmailerCampaign,
    response: apolloEmailerCampaignResponse,
  },
  'POST EmailerStep': {
    path: '/v1/emailer_steps',
    body: apolloCreateEmailerStep,
    response: z.object({
      emailer_step: apolloEmailerStep,
      // Null for templatable steps (e.g. tasks / calls)
      emailer_touch: apolloEmailerTouch.nullish(),
      emailer_template: apolloEmailerTemplate.nullish(),
    }),
  },
  'DELETE EmailerStep': {
    path: '/v1/emailer_steps/:id',
    response: z.object({ emailer_step: z.object({ id: z.string(), deleted: z.boolean() }) }),
  },
  'PUT EmailerTouch': {
    path: '/v1/emailer_touches/:id',
    body: apolloEmailerTouchUpdate,
    response: z.object({ emailer_touch: apolloEmailerTouch }),
  },
});

export function createApolloClient(cfg: { apiKey: string; axiosConfig?: AxiosRequestConfig }) {
  return new Zodios(apolloApi, {
    axiosConfig: {
      baseURL: 'https://app.apollo.io/api',
      params: { api_key: cfg.apiKey },
      ...cfg.axiosConfig,
    },
  });
}
