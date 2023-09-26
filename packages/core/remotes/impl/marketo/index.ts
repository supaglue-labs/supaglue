import type {
  ConnectionUnsafe,
  MarketoOauthConnectionCredentialsDecrypted,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import axios, { AxiosError } from 'axios';
import simpleOauth2 from 'simple-oauth2';
import {
  BadGatewayError,
  ForbiddenError,
  GatewayTimeoutError,
  InternalServerError,
  NotFoundError,
  RemoteProviderError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractMarketingAutomationRemoteClient } from '../../categories/marketing_automation/base';
import { fromMarketoFormFieldToFormField, fromMarketoFormToFormMetadata } from './mappers';

export type MarketoForm = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketoFormField = {
  id: string;
  label: string;
  dataType: string;
  validationMessage: string;
  fieldMetaData?: {
    values: {
      label: string;
      value: string;
      isDefault?: boolean;
    }[];
  };
  required: boolean;
};

type MarketoResponse<T> = {
  success: boolean;
  errors: any[];
  requestId: string;
  warnings: any[];
  result: T;
};

type MarketoClientConfig = {
  credentials: MarketoOauthConnectionCredentialsDecrypted;
  instanceUrl: string;
};

class MarketoClient extends AbstractMarketingAutomationRemoteClient {
  readonly #credentials: MarketoOauthConnectionCredentialsDecrypted;

  public constructor(config: MarketoClientConfig) {
    super(config.instanceUrl);
    this.#credentials = config.credentials;
  }

  public getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#credentials.accessToken}`,
    };
  }

  async #maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.accessToken ||
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      const oauthClient = new simpleOauth2.ClientCredentials({
        client: {
          id: this.#credentials.clientId,
          secret: this.#credentials.clientSecret,
        },
        auth: {
          tokenHost: this.baseUrl,
          tokenPath: '/identity/oauth/token',
        },
      });

      const token = await oauthClient.getToken({});
      const accessToken = token.token.access_token as string;
      const expiresAt = new Date(Date.now() + (token.token.expires_in as number)).toISOString();

      this.#credentials.accessToken = accessToken;
      this.#credentials.expiresAt = expiresAt;

      this.emit('token_refreshed', { accessToken, expiresAt });
    }
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.#maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async marketingAutomationListForms(): Promise<FormMetadata[]> {
    await this.#maybeRefreshAccessToken();

    const response = await axios.get<MarketoResponse<MarketoForm[]>>(`${this.baseUrl}/rest/asset/v1/forms.json`, {
      headers: {
        Authorization: `Bearer ${this.#credentials.accessToken}`,
      },
    });
    if (!response.data.success) {
      // the error handler expects a thrown AxiosError, so we do that here
      throw new AxiosError('Failed to list forms', undefined, response.config, response.request, response);
    }

    return response.data.result.map(fromMarketoFormToFormMetadata);
  }

  public override async marketingAutomationGetFormFields(id: string): Promise<FormField[]> {
    await this.#maybeRefreshAccessToken();

    const response = await axios.get<MarketoResponse<MarketoFormField[]>>(
      `${this.baseUrl}/rest/asset/v1/form/${id}/fields.json`,
      {
        headers: {
          Authorization: `Bearer ${this.#credentials.accessToken}`,
        },
      }
    );
    if (!response.data.success) {
      // the error handler expects a thrown AxiosError, so we do that here
      throw new AxiosError('Failed to get form fields', undefined, response.config, response.request, response);
    }

    return response.data.result.map((field) => fromMarketoFormFieldToFormField(field, id));
  }

  public override async marketingAutomationSubmitForm(
    formId: string,
    formData: SubmitFormData
  ): Promise<SubmitFormResult> {
    await this.#maybeRefreshAccessToken();

    const response = await axios.post<{
      result: [{ id?: number; status: 'updated' | 'created' | 'skipped' }];
      success: boolean;
    }>(
      `${this.baseUrl}/rest/v1/leads/submitForm.json`,
      {
        formId,
        input: [{ leadFormFields: formData }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.#credentials.accessToken}`,
        },
      }
    );

    if (!response.data.success) {
      // the error handler expects a thrown AxiosError, so we do that here
      throw new AxiosError('Failed to submit form', undefined, response.config, response.request, response);
    }

    return {
      id: response.data.result[0].id?.toString(),
      status: response.data.result[0].status,
    };
  }

  public override handleErr(err: unknown): unknown {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    const responseError = err.response?.data?.errors?.[0];

    // from https://developers.marketo.com/rest-api/error-codes/#response_level_error_codes
    switch (responseError?.code) {
      case '601':
      case '602':
        return new UnauthorizedError(responseError?.message ?? err.message, err);
      case '603':
        return new ForbiddenError(responseError?.message ?? err.message, err);
      case '604':
        return new GatewayTimeoutError(responseError?.message ?? err.message, err);
      case '606':
      case '607':
        return new TooManyRequestsError(responseError?.message ?? err.message, err);
      case '608':
      case '713':
        return new BadGatewayError(responseError?.message ?? err.message, err);
      case '609':
      case '701':
        return new InternalServerError(responseError?.message ?? err.message, err);
      case '610':
        return new NotFoundError(responseError?.message ?? err.message, err);
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      case '502':
      case '605':
      case '611':
      case '612':
      case '613':
      case '614':
      case '615':
      case '616':
      case '702':
      case '703':
      case '704':
      case '709':
      case '710':
      case '711':
      case '712':
      case '714':
      case '718':
      case '719':
        return new RemoteProviderError(responseError?.message ?? err.message, err);
    }

    // TODO: map Record-Level errors

    // TODO: map HTTP-Level errors

    return err;
  }
}

export function newClient(connection: ConnectionUnsafe<'marketo'>, provider: Provider): MarketoClient {
  return new MarketoClient({
    credentials: connection.credentials,
    instanceUrl: connection.instanceUrl,
  });
}

// this uses non-standard auth, so this isn't used. It is required to be here though.
export const authConfig = {} as ConnectorAuthConfig;
