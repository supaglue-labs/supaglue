# SyncApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSyncHistory**](SyncApi.md#getSyncHistory) | **GET** /sync-history | Get Sync History
[**getSyncInfos**](SyncApi.md#getSyncInfos) | **GET** /sync-info | Get Sync Info

<a name="getSyncHistory"></a>
# **getSyncHistory**
> InlineResponse2006 getSyncHistory(xCustomerId, xProviderName, cursor, pageSize, model)

Get Sync History

Get a list of Sync History objects.

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.SyncApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

SyncApi apiInstance = new SyncApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
String cursor = "cursor_example"; // String | The pagination cursor value
String pageSize = "pageSize_example"; // String | Number of results to return per page
String model = "model_example"; // String | The model name to filter by
try {
    InlineResponse2006 result = apiInstance.getSyncHistory(xCustomerId, xProviderName, cursor, pageSize, model);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncHistory");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |
 **cursor** | **String**| The pagination cursor value | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]
 **model** | **String**| The model name to filter by | [optional]

### Return type

[**InlineResponse2006**](InlineResponse2006.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSyncInfos"></a>
# **getSyncInfos**
> List&lt;InlineResponse2007&gt; getSyncInfos(xCustomerId, xProviderName)

Get Sync Info

Get a list of Sync Info

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.SyncApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

SyncApi apiInstance = new SyncApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
try {
    List<InlineResponse2007> result = apiInstance.getSyncInfos(xCustomerId, xProviderName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncInfos");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |

### Return type

[**List&lt;InlineResponse2007&gt;**](InlineResponse2007.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

