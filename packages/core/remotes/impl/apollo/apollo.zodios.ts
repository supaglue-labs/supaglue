import { Zodios } from '@zodios/core';
import { openApiBuilder } from '@zodios/openapi';
import type { AxiosRequestConfig } from 'axios';
import z from 'zod';
import { defineApi } from '../../utils/zodios-api-shorthand';
import {
  apolloContact,
  apolloCreateEmailerCampaign,
  apolloCreateEmailerStep,
  apolloEmailerCampaignAddContactIds,
  apolloEmailerCampaignAddContactIdsResponse,
  apolloEmailerCampaignResponse,
  apolloEmailerStep,
  apolloEmailerTemplate,
  apolloEmailerTouch,
  apolloEmailerTouchUpdate,
} from './apollo.openapi';

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
  'POST EmailerCampaignAddContactIds': {
    path: '/v1/emailer_campaigns/:id/add_contact_ids',
    body: apolloEmailerCampaignAddContactIds,
    response: apolloEmailerCampaignAddContactIdsResponse,
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
  'GET Contact': {
    path: '/v1/contacts/:id',
    response: z.object({ contact: apolloContact }),
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

export function outputZodiosOpenApi() {
  return openApiBuilder({
    title: 'Apollo API',
    version: '0.0.0',
  })
    .addServer({ url: 'https://app.apollo.io/api' })
    .addPublicApi(apolloApi)
    .build();
}
if (require.main === module) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(outputZodiosOpenApi(), null, 2));
}
