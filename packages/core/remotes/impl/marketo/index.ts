import type {
  ConnectionUnsafe,
  MarketoOauthConnectionCredentialsDecrypted,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import axios, { AxiosError } from 'axios';
import simpleOauth2 from 'simple-oauth2';
import {
  BadGatewayError,
  BadRequestError,
  ForbiddenError,
  GatewayTimeoutError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractMarketingAutomationRemoteClient } from '../../categories/marketing_automation/base';

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

  public override async submitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
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

    const jsonError = err.response?.data?.errors?.[0];

    // from https://developers.marketo.com/rest-api/error-codes/#response_level_error_codes
    switch (jsonError?.code) {
      case '601':
      case '602':
        return new UnauthorizedError(jsonError?.message ?? err.message, err);
      case '603':
        return new ForbiddenError(jsonError?.message ?? err.message, err);
      case '604':
        return new GatewayTimeoutError(jsonError?.message ?? err.message, err);
      case '606':
      case '607':
        return new TooManyRequestsError(jsonError?.message ?? err.message, err);
      case '608':
      case '713':
        return new BadGatewayError(jsonError?.message ?? err.message, err);
      case '609':
      case '701':
        return new BadRequestError(jsonError?.message ?? err.message, err);
      case '610':
        return new NotFoundError(jsonError?.message ?? err.message, err);
    }

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
