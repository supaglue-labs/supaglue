/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ```
 *
 * OpenAPI spec version: 0.3.0
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import globalAxios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BaseAPI, BASE_PATH, RequestArgs } from '../base';
import { InlineResponse2004 } from '../models';
/**
 * SyncInfoApi - axios parameter creator
 * @export
 */
export const SyncInfoApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     * Get a list of Sync Info
     * @summary Get Sync Info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSyncInfos: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      const localVarPath = `/sync-info`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * SyncInfoApi - functional programming interface
 * @export
 */
export const SyncInfoApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Get a list of Sync Info
     * @summary Get Sync Info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSyncInfos(
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<InlineResponse2004>>>> {
      const localVarAxiosArgs = await SyncInfoApiAxiosParamCreator(configuration).getSyncInfos(options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * SyncInfoApi - factory interface
 * @export
 */
export const SyncInfoApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     * Get a list of Sync Info
     * @summary Get Sync Info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSyncInfos(options?: AxiosRequestConfig): Promise<AxiosResponse<Array<InlineResponse2004>>> {
      return SyncInfoApiFp(configuration)
        .getSyncInfos(options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SyncInfoApi - object-oriented interface
 * @export
 * @class SyncInfoApi
 * @extends {BaseAPI}
 */
export class SyncInfoApi extends BaseAPI {
  /**
   * Get a list of Sync Info
   * @summary Get Sync Info
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SyncInfoApi
   */
  public async getSyncInfos(options?: AxiosRequestConfig): Promise<AxiosResponse<Array<InlineResponse2004>>> {
    return SyncInfoApiFp(this.configuration)
      .getSyncInfos(options)
      .then((request) => request(this.axios, this.basePath));
  }
}
