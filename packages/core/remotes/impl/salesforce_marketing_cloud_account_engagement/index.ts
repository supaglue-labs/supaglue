// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import type {
  ConnectionUnsafe,
  MarketingAutomationProvider,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import axios, { AxiosError } from 'axios';
import simpleOauth2 from 'simple-oauth2';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractMarketingAutomationRemoteClient } from '../../categories/marketing_automation/base';
import { fromPardotFormHandlerFieldToFormField, fromPardotFormHandlerToFormMetadata } from './mappers';

const FORM_HANDLER_FIELDS = [
  'id',
  'name',
  'folderId',
  'campaignId',
  'trackerDomainId',
  'isDataForwarded',
  'successLocation',
  'errorLocation',
  'isAlwaysEmail',
  'isCookieLess',
  'salesforceId',
  'embedCode',
  'createdAt',
  'updatedAt',
  'createdById',
  'isDeleted',
  'updatedById',
];

const FORM_HANDLER_FIELD_FIELDS = [
  'id',
  'name',
  'formHandlerId',
  'isRequired',
  'dataFormat',
  'prospectApiFieldId',
  'isMaintainInitialValue',
  'errorMessage',
  'createdAt',
  'createdById',
];

export type PardotFormHandler = {
  id: number;
  name: string;
  updatedAt: string;
  createdAt: string;
};

export type PardotFormHandlerField = {
  id: number;
  name: string;
  formHandlerId: number;
  dataFormat: string;
  isRequired: boolean;
  errorMessage?: string;
};

export type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  businessUnitId: string;
  clientId: string;
  clientSecret: string;
  loginUrl?: string;
};

class SalesforceMarketingCloudAccountEngagmentClient extends AbstractMarketingAutomationRemoteClient {
  readonly #credentials: Credentials;

  public constructor(credentials: Credentials) {
    // TODO ask the user if it's a dev/sandbox account or prod account and set accordingly
    super('https://pi.demo.pardot.com');
    this.#credentials = credentials;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#credentials.accessToken}`,
      'Pardot-Business-Unit-Id': this.#credentials.businessUnitId,
    };
  }

  async #refreshAccessToken(): Promise<void> {
    const oauthClient = new simpleOauth2.AuthorizationCode({
      client: {
        id: this.#credentials.clientId,
        secret: this.#credentials.clientSecret,
      },
      auth: {
        tokenHost: this.#credentials.loginUrl ?? authConfig.tokenHost,
        tokenPath: authConfig.tokenPath,
        authorizePath: authConfig.authorizePath,
      },
    });
    const token = oauthClient.createToken({
      refresh_token: this.#credentials.refreshToken,
    });

    const newToken = await token.refresh();

    const newAccessToken = newToken.token.access_token as string;
    const newRefreshToken = newToken.token.refresh_token as string;

    this.#credentials.accessToken = newAccessToken;
    this.#credentials.refreshToken = newRefreshToken;

    this.emit('token_refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: null,
    });
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // TODO(735): We should have a periodic workflow for refreshing tokens for all connections
    await this.#refreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async listForms() {
    await this.#refreshAccessToken();

    const url = `${this.baseUrl}/api/v5/objects/form-handlers?fields=${FORM_HANDLER_FIELDS.join(',')}`;

    const response = await axios.get<{ values: PardotFormHandler[] }>(url, {
      headers: {
        Authorization: `Bearer ${this.#credentials.accessToken}`,
        'Pardot-Business-Unit-Id': this.#credentials.businessUnitId,
      },
    });

    return response.data.values.map(fromPardotFormHandlerToFormMetadata);
  }

  public override async getFormFields(id: string) {
    await this.#refreshAccessToken();

    const url = `${
      this.baseUrl
    }/api/v5/objects/form-handler-fields?formHandlerId=${id}&fields=${FORM_HANDLER_FIELD_FIELDS.join(',')}`;

    const response = await axios.get<{ values: PardotFormHandlerField[] }>(url, {
      headers: {
        Authorization: `Bearer ${this.#credentials.accessToken}`,
        'Pardot-Business-Unit-Id': this.#credentials.businessUnitId,
      },
    });

    return response.data.values.map(fromPardotFormHandlerFieldToFormField);
  }

  public override async submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
    await this.#refreshAccessToken();

    // get the form submit url
    const response = await axios.get<{ embedCode: string }>(
      `${this.baseUrl}/api/v5/objects/form-handlers/${formId}?fields=embedCode`,
      {
        headers: {
          Authorization: `Bearer ${this.#credentials.accessToken}`,
          'Pardot-Business-Unit-Id': this.#credentials.businessUnitId,
        },
      }
    );

    const { embedCode } = response.data;

    const submitUrl = embedCode.split('action="')[1].split('"')[0];

    // submit the form
    try {
      await axios.post<{ id: string }>(submitUrl, new URLSearchParams(formData as any), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://supaglue.com/',
        },
        maxRedirects: 0, // we want the response, not the redirect
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // only throw if it's not a 302
        if (err.response?.status !== 302) {
          throw err;
        }
      }
    }

    // TODO there's no way to get the created/updated prospect id from the form submit, it seems.
    //      There's also no way to tell if it was created or updated.
    return {
      status: 'created',
    };
  }

  public override handleErr(err: unknown): unknown {
    // TODO implement error handling from
    // https://developer.salesforce.com/docs/marketing/pardot/guide/error-codes.html#error-responses-in-api-version-5

    return err;
  }
}

export function newClient(
  connection: ConnectionUnsafe<'salesforce_marketing_cloud_account_engagement'>,
  provider: Provider
): SalesforceMarketingCloudAccountEngagmentClient {
  return new SalesforceMarketingCloudAccountEngagmentClient({
    businessUnitId: connection.credentials.businessUnitId,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: (provider as MarketingAutomationProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as MarketingAutomationProvider).config.oauth.credentials.oauthClientSecret,
    loginUrl: connection.credentials.loginUrl,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.salesforce.com',
  tokenPath: '/services/oauth2/token',
  authorizeHost: 'https://login.salesforce.com',
  authorizePath: '/services/oauth2/authorize',
};
