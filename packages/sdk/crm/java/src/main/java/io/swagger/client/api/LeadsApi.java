/*
 * Supaglue CRM API
 * # Introduction  Welcome to the Supaglue unified CRM API documentation. You can use this API to read data that has been synced into Supaglue from third-party providers.  ### Base API URL  ``` http://localhost:8080/api/crm/v1 ``` 
 *
 * OpenAPI spec version: 0.3.3
 * Contact: docs@supaglue.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package io.swagger.client.api;

import io.swagger.client.ApiCallback;
import io.swagger.client.ApiClient;
import io.swagger.client.ApiException;
import io.swagger.client.ApiResponse;
import io.swagger.client.Configuration;
import io.swagger.client.Pair;
import io.swagger.client.ProgressRequestBody;
import io.swagger.client.ProgressResponseBody;

import com.google.gson.reflect.TypeToken;

import java.io.IOException;


import io.swagger.client.model.InlineResponse2002;
import io.swagger.client.model.InlineResponse2012;
import io.swagger.client.model.Lead;
import io.swagger.client.model.LeadsBody;
import io.swagger.client.model.LeadsLeadIdBody;
import org.threeten.bp.OffsetDateTime;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LeadsApi {
    private ApiClient apiClient;

    public LeadsApi() {
        this(Configuration.getDefaultApiClient());
    }

    public LeadsApi(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public ApiClient getApiClient() {
        return apiClient;
    }

    public void setApiClient(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Build call for createLead
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param progressListener Progress listener
     * @param progressRequestListener Progress request listener
     * @return Call to execute
     * @throws ApiException If fail to serialize the request body object
     */
    public com.squareup.okhttp.Call createLeadCall(LeadsBody body, String customerId, String providerName, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        Object localVarPostBody = body;
        
        // create path and map variables
        String localVarPath = "/leads";

        List<Pair> localVarQueryParams = new ArrayList<Pair>();
        List<Pair> localVarCollectionQueryParams = new ArrayList<Pair>();

        Map<String, String> localVarHeaderParams = new HashMap<String, String>();
        if (customerId != null)
        localVarHeaderParams.put("customer-id", apiClient.parameterToString(customerId));
        if (providerName != null)
        localVarHeaderParams.put("provider-name", apiClient.parameterToString(providerName));

        Map<String, Object> localVarFormParams = new HashMap<String, Object>();

        final String[] localVarAccepts = {
            "application/json"
        };
        final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        if (localVarAccept != null) localVarHeaderParams.put("Accept", localVarAccept);

        final String[] localVarContentTypes = {
            "application/json"
        };
        final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);
        localVarHeaderParams.put("Content-Type", localVarContentType);

        if(progressListener != null) {
            apiClient.getHttpClient().networkInterceptors().add(new com.squareup.okhttp.Interceptor() {
                @Override
                public com.squareup.okhttp.Response intercept(com.squareup.okhttp.Interceptor.Chain chain) throws IOException {
                    com.squareup.okhttp.Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                    .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                    .build();
                }
            });
        }

        String[] localVarAuthNames = new String[] {  };
        return apiClient.buildCall(localVarPath, "POST", localVarQueryParams, localVarCollectionQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAuthNames, progressRequestListener);
    }
    
    @SuppressWarnings("rawtypes")
    private com.squareup.okhttp.Call createLeadValidateBeforeCall(LeadsBody body, String customerId, String providerName, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        // verify the required parameter 'body' is set
        if (body == null) {
            throw new ApiException("Missing the required parameter 'body' when calling createLead(Async)");
        }
        // verify the required parameter 'customerId' is set
        if (customerId == null) {
            throw new ApiException("Missing the required parameter 'customerId' when calling createLead(Async)");
        }
        // verify the required parameter 'providerName' is set
        if (providerName == null) {
            throw new ApiException("Missing the required parameter 'providerName' when calling createLead(Async)");
        }
        
        com.squareup.okhttp.Call call = createLeadCall(body, customerId, providerName, progressListener, progressRequestListener);
        return call;

        
        
        
        
    }

    /**
     * Create lead
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @return InlineResponse2012
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public InlineResponse2012 createLead(LeadsBody body, String customerId, String providerName) throws ApiException {
        ApiResponse<InlineResponse2012> resp = createLeadWithHttpInfo(body, customerId, providerName);
        return resp.getData();
    }

    /**
     * Create lead
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @return ApiResponse&lt;InlineResponse2012&gt;
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public ApiResponse<InlineResponse2012> createLeadWithHttpInfo(LeadsBody body, String customerId, String providerName) throws ApiException {
        com.squareup.okhttp.Call call = createLeadValidateBeforeCall(body, customerId, providerName, null, null);
        Type localVarReturnType = new TypeToken<InlineResponse2012>(){}.getType();
        return apiClient.execute(call, localVarReturnType);
    }

    /**
     * Create lead (asynchronously)
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param callback The callback to be executed when the API call finishes
     * @return The request call
     * @throws ApiException If fail to process the API call, e.g. serializing the request body object
     */
    public com.squareup.okhttp.Call createLeadAsync(LeadsBody body, String customerId, String providerName, final ApiCallback<InlineResponse2012> callback) throws ApiException {

        ProgressResponseBody.ProgressListener progressListener = null;
        ProgressRequestBody.ProgressRequestListener progressRequestListener = null;

        if (callback != null) {
            progressListener = new ProgressResponseBody.ProgressListener() {
                @Override
                public void update(long bytesRead, long contentLength, boolean done) {
                    callback.onDownloadProgress(bytesRead, contentLength, done);
                }
            };

            progressRequestListener = new ProgressRequestBody.ProgressRequestListener() {
                @Override
                public void onRequestProgress(long bytesWritten, long contentLength, boolean done) {
                    callback.onUploadProgress(bytesWritten, contentLength, done);
                }
            };
        }

        com.squareup.okhttp.Call call = createLeadValidateBeforeCall(body, customerId, providerName, progressListener, progressRequestListener);
        Type localVarReturnType = new TypeToken<InlineResponse2012>(){}.getType();
        apiClient.executeAsync(call, localVarReturnType, callback);
        return call;
    }
    /**
     * Build call for getLead
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param progressListener Progress listener
     * @param progressRequestListener Progress request listener
     * @return Call to execute
     * @throws ApiException If fail to serialize the request body object
     */
    public com.squareup.okhttp.Call getLeadCall(String customerId, String providerName, String leadId, String expand, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        Object localVarPostBody = null;
        
        // create path and map variables
        String localVarPath = "/leads/{lead_id}"
            .replaceAll("\\{" + "lead_id" + "\\}", apiClient.escapeString(leadId.toString()));

        List<Pair> localVarQueryParams = new ArrayList<Pair>();
        List<Pair> localVarCollectionQueryParams = new ArrayList<Pair>();
        if (expand != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("expand", expand));

        Map<String, String> localVarHeaderParams = new HashMap<String, String>();
        if (customerId != null)
        localVarHeaderParams.put("customer-id", apiClient.parameterToString(customerId));
        if (providerName != null)
        localVarHeaderParams.put("provider-name", apiClient.parameterToString(providerName));

        Map<String, Object> localVarFormParams = new HashMap<String, Object>();

        final String[] localVarAccepts = {
            "application/json"
        };
        final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        if (localVarAccept != null) localVarHeaderParams.put("Accept", localVarAccept);

        final String[] localVarContentTypes = {
            
        };
        final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);
        localVarHeaderParams.put("Content-Type", localVarContentType);

        if(progressListener != null) {
            apiClient.getHttpClient().networkInterceptors().add(new com.squareup.okhttp.Interceptor() {
                @Override
                public com.squareup.okhttp.Response intercept(com.squareup.okhttp.Interceptor.Chain chain) throws IOException {
                    com.squareup.okhttp.Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                    .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                    .build();
                }
            });
        }

        String[] localVarAuthNames = new String[] {  };
        return apiClient.buildCall(localVarPath, "GET", localVarQueryParams, localVarCollectionQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAuthNames, progressRequestListener);
    }
    
    @SuppressWarnings("rawtypes")
    private com.squareup.okhttp.Call getLeadValidateBeforeCall(String customerId, String providerName, String leadId, String expand, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        // verify the required parameter 'customerId' is set
        if (customerId == null) {
            throw new ApiException("Missing the required parameter 'customerId' when calling getLead(Async)");
        }
        // verify the required parameter 'providerName' is set
        if (providerName == null) {
            throw new ApiException("Missing the required parameter 'providerName' when calling getLead(Async)");
        }
        // verify the required parameter 'leadId' is set
        if (leadId == null) {
            throw new ApiException("Missing the required parameter 'leadId' when calling getLead(Async)");
        }
        
        com.squareup.okhttp.Call call = getLeadCall(customerId, providerName, leadId, expand, progressListener, progressRequestListener);
        return call;

        
        
        
        
    }

    /**
     * Get lead
     * 
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @return Lead
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public Lead getLead(String customerId, String providerName, String leadId, String expand) throws ApiException {
        ApiResponse<Lead> resp = getLeadWithHttpInfo(customerId, providerName, leadId, expand);
        return resp.getData();
    }

    /**
     * Get lead
     * 
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @return ApiResponse&lt;Lead&gt;
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public ApiResponse<Lead> getLeadWithHttpInfo(String customerId, String providerName, String leadId, String expand) throws ApiException {
        com.squareup.okhttp.Call call = getLeadValidateBeforeCall(customerId, providerName, leadId, expand, null, null);
        Type localVarReturnType = new TypeToken<Lead>(){}.getType();
        return apiClient.execute(call, localVarReturnType);
    }

    /**
     * Get lead (asynchronously)
     * 
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param callback The callback to be executed when the API call finishes
     * @return The request call
     * @throws ApiException If fail to process the API call, e.g. serializing the request body object
     */
    public com.squareup.okhttp.Call getLeadAsync(String customerId, String providerName, String leadId, String expand, final ApiCallback<Lead> callback) throws ApiException {

        ProgressResponseBody.ProgressListener progressListener = null;
        ProgressRequestBody.ProgressRequestListener progressRequestListener = null;

        if (callback != null) {
            progressListener = new ProgressResponseBody.ProgressListener() {
                @Override
                public void update(long bytesRead, long contentLength, boolean done) {
                    callback.onDownloadProgress(bytesRead, contentLength, done);
                }
            };

            progressRequestListener = new ProgressRequestBody.ProgressRequestListener() {
                @Override
                public void onRequestProgress(long bytesWritten, long contentLength, boolean done) {
                    callback.onUploadProgress(bytesWritten, contentLength, done);
                }
            };
        }

        com.squareup.okhttp.Call call = getLeadValidateBeforeCall(customerId, providerName, leadId, expand, progressListener, progressRequestListener);
        Type localVarReturnType = new TypeToken<Lead>(){}.getType();
        apiClient.executeAsync(call, localVarReturnType, callback);
        return call;
    }
    /**
     * Build call for getLeads
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param createdAfter If provided, will only return objects created after this datetime (optional)
     * @param createdBefore If provided, will only return objects created before this datetime (optional)
     * @param updatedAfter If provided, will only return objects modified after this datetime (optional)
     * @param updatedBefore If provided, will only return objects modified before this datetime (optional)
     * @param cursor The pagination cursor value (optional)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param pageSize Number of results to return per page (optional)
     * @param progressListener Progress listener
     * @param progressRequestListener Progress request listener
     * @return Call to execute
     * @throws ApiException If fail to serialize the request body object
     */
    public com.squareup.okhttp.Call getLeadsCall(String customerId, String providerName, OffsetDateTime createdAfter, OffsetDateTime createdBefore, OffsetDateTime updatedAfter, OffsetDateTime updatedBefore, String cursor, String expand, String pageSize, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        Object localVarPostBody = null;
        
        // create path and map variables
        String localVarPath = "/leads";

        List<Pair> localVarQueryParams = new ArrayList<Pair>();
        List<Pair> localVarCollectionQueryParams = new ArrayList<Pair>();
        if (createdAfter != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("created_after", createdAfter));
        if (createdBefore != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("created_before", createdBefore));
        if (updatedAfter != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("updated_after", updatedAfter));
        if (updatedBefore != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("updated_before", updatedBefore));
        if (cursor != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("cursor", cursor));
        if (expand != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("expand", expand));
        if (pageSize != null)
        localVarQueryParams.addAll(apiClient.parameterToPair("page_size", pageSize));

        Map<String, String> localVarHeaderParams = new HashMap<String, String>();
        if (customerId != null)
        localVarHeaderParams.put("customer-id", apiClient.parameterToString(customerId));
        if (providerName != null)
        localVarHeaderParams.put("provider-name", apiClient.parameterToString(providerName));

        Map<String, Object> localVarFormParams = new HashMap<String, Object>();

        final String[] localVarAccepts = {
            "application/json"
        };
        final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        if (localVarAccept != null) localVarHeaderParams.put("Accept", localVarAccept);

        final String[] localVarContentTypes = {
            
        };
        final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);
        localVarHeaderParams.put("Content-Type", localVarContentType);

        if(progressListener != null) {
            apiClient.getHttpClient().networkInterceptors().add(new com.squareup.okhttp.Interceptor() {
                @Override
                public com.squareup.okhttp.Response intercept(com.squareup.okhttp.Interceptor.Chain chain) throws IOException {
                    com.squareup.okhttp.Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                    .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                    .build();
                }
            });
        }

        String[] localVarAuthNames = new String[] {  };
        return apiClient.buildCall(localVarPath, "GET", localVarQueryParams, localVarCollectionQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAuthNames, progressRequestListener);
    }
    
    @SuppressWarnings("rawtypes")
    private com.squareup.okhttp.Call getLeadsValidateBeforeCall(String customerId, String providerName, OffsetDateTime createdAfter, OffsetDateTime createdBefore, OffsetDateTime updatedAfter, OffsetDateTime updatedBefore, String cursor, String expand, String pageSize, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        // verify the required parameter 'customerId' is set
        if (customerId == null) {
            throw new ApiException("Missing the required parameter 'customerId' when calling getLeads(Async)");
        }
        // verify the required parameter 'providerName' is set
        if (providerName == null) {
            throw new ApiException("Missing the required parameter 'providerName' when calling getLeads(Async)");
        }
        
        com.squareup.okhttp.Call call = getLeadsCall(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize, progressListener, progressRequestListener);
        return call;

        
        
        
        
    }

    /**
     * List leads
     * Get a list of leads
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param createdAfter If provided, will only return objects created after this datetime (optional)
     * @param createdBefore If provided, will only return objects created before this datetime (optional)
     * @param updatedAfter If provided, will only return objects modified after this datetime (optional)
     * @param updatedBefore If provided, will only return objects modified before this datetime (optional)
     * @param cursor The pagination cursor value (optional)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param pageSize Number of results to return per page (optional)
     * @return InlineResponse2002
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public InlineResponse2002 getLeads(String customerId, String providerName, OffsetDateTime createdAfter, OffsetDateTime createdBefore, OffsetDateTime updatedAfter, OffsetDateTime updatedBefore, String cursor, String expand, String pageSize) throws ApiException {
        ApiResponse<InlineResponse2002> resp = getLeadsWithHttpInfo(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
        return resp.getData();
    }

    /**
     * List leads
     * Get a list of leads
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param createdAfter If provided, will only return objects created after this datetime (optional)
     * @param createdBefore If provided, will only return objects created before this datetime (optional)
     * @param updatedAfter If provided, will only return objects modified after this datetime (optional)
     * @param updatedBefore If provided, will only return objects modified before this datetime (optional)
     * @param cursor The pagination cursor value (optional)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param pageSize Number of results to return per page (optional)
     * @return ApiResponse&lt;InlineResponse2002&gt;
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public ApiResponse<InlineResponse2002> getLeadsWithHttpInfo(String customerId, String providerName, OffsetDateTime createdAfter, OffsetDateTime createdBefore, OffsetDateTime updatedAfter, OffsetDateTime updatedBefore, String cursor, String expand, String pageSize) throws ApiException {
        com.squareup.okhttp.Call call = getLeadsValidateBeforeCall(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize, null, null);
        Type localVarReturnType = new TypeToken<InlineResponse2002>(){}.getType();
        return apiClient.execute(call, localVarReturnType);
    }

    /**
     * List leads (asynchronously)
     * Get a list of leads
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param createdAfter If provided, will only return objects created after this datetime (optional)
     * @param createdBefore If provided, will only return objects created before this datetime (optional)
     * @param updatedAfter If provided, will only return objects modified after this datetime (optional)
     * @param updatedBefore If provided, will only return objects modified before this datetime (optional)
     * @param cursor The pagination cursor value (optional)
     * @param expand Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
     * @param pageSize Number of results to return per page (optional)
     * @param callback The callback to be executed when the API call finishes
     * @return The request call
     * @throws ApiException If fail to process the API call, e.g. serializing the request body object
     */
    public com.squareup.okhttp.Call getLeadsAsync(String customerId, String providerName, OffsetDateTime createdAfter, OffsetDateTime createdBefore, OffsetDateTime updatedAfter, OffsetDateTime updatedBefore, String cursor, String expand, String pageSize, final ApiCallback<InlineResponse2002> callback) throws ApiException {

        ProgressResponseBody.ProgressListener progressListener = null;
        ProgressRequestBody.ProgressRequestListener progressRequestListener = null;

        if (callback != null) {
            progressListener = new ProgressResponseBody.ProgressListener() {
                @Override
                public void update(long bytesRead, long contentLength, boolean done) {
                    callback.onDownloadProgress(bytesRead, contentLength, done);
                }
            };

            progressRequestListener = new ProgressRequestBody.ProgressRequestListener() {
                @Override
                public void onRequestProgress(long bytesWritten, long contentLength, boolean done) {
                    callback.onUploadProgress(bytesWritten, contentLength, done);
                }
            };
        }

        com.squareup.okhttp.Call call = getLeadsValidateBeforeCall(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize, progressListener, progressRequestListener);
        Type localVarReturnType = new TypeToken<InlineResponse2002>(){}.getType();
        apiClient.executeAsync(call, localVarReturnType, callback);
        return call;
    }
    /**
     * Build call for updateLead
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param progressListener Progress listener
     * @param progressRequestListener Progress request listener
     * @return Call to execute
     * @throws ApiException If fail to serialize the request body object
     */
    public com.squareup.okhttp.Call updateLeadCall(LeadsLeadIdBody body, String customerId, String providerName, String leadId, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        Object localVarPostBody = body;
        
        // create path and map variables
        String localVarPath = "/leads/{lead_id}"
            .replaceAll("\\{" + "lead_id" + "\\}", apiClient.escapeString(leadId.toString()));

        List<Pair> localVarQueryParams = new ArrayList<Pair>();
        List<Pair> localVarCollectionQueryParams = new ArrayList<Pair>();

        Map<String, String> localVarHeaderParams = new HashMap<String, String>();
        if (customerId != null)
        localVarHeaderParams.put("customer-id", apiClient.parameterToString(customerId));
        if (providerName != null)
        localVarHeaderParams.put("provider-name", apiClient.parameterToString(providerName));

        Map<String, Object> localVarFormParams = new HashMap<String, Object>();

        final String[] localVarAccepts = {
            "application/json"
        };
        final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        if (localVarAccept != null) localVarHeaderParams.put("Accept", localVarAccept);

        final String[] localVarContentTypes = {
            "application/json"
        };
        final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);
        localVarHeaderParams.put("Content-Type", localVarContentType);

        if(progressListener != null) {
            apiClient.getHttpClient().networkInterceptors().add(new com.squareup.okhttp.Interceptor() {
                @Override
                public com.squareup.okhttp.Response intercept(com.squareup.okhttp.Interceptor.Chain chain) throws IOException {
                    com.squareup.okhttp.Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                    .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                    .build();
                }
            });
        }

        String[] localVarAuthNames = new String[] {  };
        return apiClient.buildCall(localVarPath, "PATCH", localVarQueryParams, localVarCollectionQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAuthNames, progressRequestListener);
    }
    
    @SuppressWarnings("rawtypes")
    private com.squareup.okhttp.Call updateLeadValidateBeforeCall(LeadsLeadIdBody body, String customerId, String providerName, String leadId, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        // verify the required parameter 'body' is set
        if (body == null) {
            throw new ApiException("Missing the required parameter 'body' when calling updateLead(Async)");
        }
        // verify the required parameter 'customerId' is set
        if (customerId == null) {
            throw new ApiException("Missing the required parameter 'customerId' when calling updateLead(Async)");
        }
        // verify the required parameter 'providerName' is set
        if (providerName == null) {
            throw new ApiException("Missing the required parameter 'providerName' when calling updateLead(Async)");
        }
        // verify the required parameter 'leadId' is set
        if (leadId == null) {
            throw new ApiException("Missing the required parameter 'leadId' when calling updateLead(Async)");
        }
        
        com.squareup.okhttp.Call call = updateLeadCall(body, customerId, providerName, leadId, progressListener, progressRequestListener);
        return call;

        
        
        
        
    }

    /**
     * Update lead
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @return InlineResponse2012
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public InlineResponse2012 updateLead(LeadsLeadIdBody body, String customerId, String providerName, String leadId) throws ApiException {
        ApiResponse<InlineResponse2012> resp = updateLeadWithHttpInfo(body, customerId, providerName, leadId);
        return resp.getData();
    }

    /**
     * Update lead
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @return ApiResponse&lt;InlineResponse2012&gt;
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public ApiResponse<InlineResponse2012> updateLeadWithHttpInfo(LeadsLeadIdBody body, String customerId, String providerName, String leadId) throws ApiException {
        com.squareup.okhttp.Call call = updateLeadValidateBeforeCall(body, customerId, providerName, leadId, null, null);
        Type localVarReturnType = new TypeToken<InlineResponse2012>(){}.getType();
        return apiClient.execute(call, localVarReturnType);
    }

    /**
     * Update lead (asynchronously)
     * 
     * @param body  (required)
     * @param customerId The customer ID (required)
     * @param providerName The provider name (required)
     * @param leadId  (required)
     * @param callback The callback to be executed when the API call finishes
     * @return The request call
     * @throws ApiException If fail to process the API call, e.g. serializing the request body object
     */
    public com.squareup.okhttp.Call updateLeadAsync(LeadsLeadIdBody body, String customerId, String providerName, String leadId, final ApiCallback<InlineResponse2012> callback) throws ApiException {

        ProgressResponseBody.ProgressListener progressListener = null;
        ProgressRequestBody.ProgressRequestListener progressRequestListener = null;

        if (callback != null) {
            progressListener = new ProgressResponseBody.ProgressListener() {
                @Override
                public void update(long bytesRead, long contentLength, boolean done) {
                    callback.onDownloadProgress(bytesRead, contentLength, done);
                }
            };

            progressRequestListener = new ProgressRequestBody.ProgressRequestListener() {
                @Override
                public void onRequestProgress(long bytesWritten, long contentLength, boolean done) {
                    callback.onUploadProgress(bytesWritten, contentLength, done);
                }
            };
        }

        com.squareup.okhttp.Call call = updateLeadValidateBeforeCall(body, customerId, providerName, leadId, progressListener, progressRequestListener);
        Type localVarReturnType = new TypeToken<InlineResponse2012>(){}.getType();
        apiClient.executeAsync(call, localVarReturnType, callback);
        return call;
    }
}
