/* tslint:disable */
/* eslint-disable */
/**
 * Supaglue Management API
 * # Introduction  Welcome to the Supaglue Management API documentation. You can use this API to manage customer integrations and connections.  ### Base API URL  ``` http://localhost:8080/mgmt/v1 ``` 
 *
 * OpenAPI spec version: 0.4.1
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import globalAxios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
import { CreateUpdateCustomer } from '../models';
import { Customer } from '../models';
/**
 * CustomersApi - axios parameter creator
 * @export
 */
export const CustomersApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Delete customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteCustomer: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/customers/{customer_id}`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            if (configuration && configuration.apiKey) {
                const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                    ? await configuration.apiKey("x-api-key")
                    : await configuration.apiKey;
                localVarHeaderParameter["x-api-key"] = localVarApiKeyValue;
            }

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Get customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCustomer: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/customers/{customer_id}`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            if (configuration && configuration.apiKey) {
                const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                    ? await configuration.apiKey("x-api-key")
                    : await configuration.apiKey;
                localVarHeaderParameter["x-api-key"] = localVarApiKeyValue;
            }

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Get a list of customers
         * @summary List customers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCustomers: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/customers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            if (configuration && configuration.apiKey) {
                const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                    ? await configuration.apiKey("x-api-key")
                    : await configuration.apiKey;
                localVarHeaderParameter["x-api-key"] = localVarApiKeyValue;
            }

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Upsert customer
         * @param {CreateUpdateCustomer} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        upsertCustomer: async (body: CreateUpdateCustomer, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling upsertCustomer.');
            }
            const localVarPath = `/customers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'PUT', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            if (configuration && configuration.apiKey) {
                const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                    ? await configuration.apiKey("x-api-key")
                    : await configuration.apiKey;
                localVarHeaderParameter["x-api-key"] = localVarApiKeyValue;
            }

            localVarHeaderParameter['Content-Type'] = 'application/json';

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            const needsSerialization = (typeof body !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : (body || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * CustomersApi - functional programming interface
 * @export
 */
export const CustomersApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Delete customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteCustomer(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Customer>>> {
            const localVarAxiosArgs = await CustomersApiAxiosParamCreator(configuration).deleteCustomer(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Get customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCustomer(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Customer>>> {
            const localVarAxiosArgs = await CustomersApiAxiosParamCreator(configuration).getCustomer(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Get a list of customers
         * @summary List customers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCustomers(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<any>>> {
            const localVarAxiosArgs = await CustomersApiAxiosParamCreator(configuration).getCustomers(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Upsert customer
         * @param {CreateUpdateCustomer} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async upsertCustomer(body: CreateUpdateCustomer, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Customer>>> {
            const localVarAxiosArgs = await CustomersApiAxiosParamCreator(configuration).upsertCustomer(body, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * CustomersApi - factory interface
 * @export
 */
export const CustomersApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary Delete customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteCustomer(options?: AxiosRequestConfig): Promise<AxiosResponse<Customer>> {
            return CustomersApiFp(configuration).deleteCustomer(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Get customer
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCustomer(options?: AxiosRequestConfig): Promise<AxiosResponse<Customer>> {
            return CustomersApiFp(configuration).getCustomer(options).then((request) => request(axios, basePath));
        },
        /**
         * Get a list of customers
         * @summary List customers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCustomers(options?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
            return CustomersApiFp(configuration).getCustomers(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Upsert customer
         * @param {CreateUpdateCustomer} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async upsertCustomer(body: CreateUpdateCustomer, options?: AxiosRequestConfig): Promise<AxiosResponse<Customer>> {
            return CustomersApiFp(configuration).upsertCustomer(body, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * CustomersApi - object-oriented interface
 * @export
 * @class CustomersApi
 * @extends {BaseAPI}
 */
export class CustomersApi extends BaseAPI {
    /**
     * 
     * @summary Delete customer
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomersApi
     */
    public async deleteCustomer(options?: AxiosRequestConfig) : Promise<AxiosResponse<Customer>> {
        return CustomersApiFp(this.configuration).deleteCustomer(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * 
     * @summary Get customer
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomersApi
     */
    public async getCustomer(options?: AxiosRequestConfig) : Promise<AxiosResponse<Customer>> {
        return CustomersApiFp(this.configuration).getCustomer(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Get a list of customers
     * @summary List customers
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomersApi
     */
    public async getCustomers(options?: AxiosRequestConfig) : Promise<AxiosResponse<any>> {
        return CustomersApiFp(this.configuration).getCustomers(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * 
     * @summary Upsert customer
     * @param {CreateUpdateCustomer} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomersApi
     */
    public async upsertCustomer(body: CreateUpdateCustomer, options?: AxiosRequestConfig) : Promise<AxiosResponse<Customer>> {
        return CustomersApiFp(this.configuration).upsertCustomer(body, options).then((request) => request(this.axios, this.basePath));
    }
}
