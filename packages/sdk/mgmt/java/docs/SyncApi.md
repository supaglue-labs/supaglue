# SyncApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSyncHistory**](SyncApi.md#getSyncHistory) | **GET** /sync-history | Get Sync History
[**getSyncInfos**](SyncApi.md#getSyncInfos) | **GET** /sync-info | Get Sync Info

<a name="getSyncHistory"></a>
# **getSyncHistory**
> Object getSyncHistory(cursor, pageSize, customerId, providerName, model)

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
Object cursor = null; // Object | The pagination cursor value
Object pageSize = null; // Object | Number of results to return per page
Object customerId = null; // Object | The customer ID that uniquely identifies the customer in your application
Object providerName = null; // Object | The provider name
Object model = null; // Object | The model name to filter by
try {
    Object result = apiInstance.getSyncHistory(cursor, pageSize, customerId, providerName, model);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncHistory");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | [**Object**](.md)| The pagination cursor value | [optional]
 **pageSize** | [**Object**](.md)| Number of results to return per page | [optional]
 **customerId** | [**Object**](.md)| The customer ID that uniquely identifies the customer in your application | [optional]
 **providerName** | [**Object**](.md)| The provider name | [optional]
 **model** | [**Object**](.md)| The model name to filter by | [optional]

### Return type

**Object**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSyncInfos"></a>
# **getSyncInfos**
> Object getSyncInfos(customerId, providerName)

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
Object customerId = null; // Object | The customer ID that uniquely identifies the customer in your application
Object providerName = null; // Object | The provider name
try {
    Object result = apiInstance.getSyncInfos(customerId, providerName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncInfos");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | [**Object**](.md)| The customer ID that uniquely identifies the customer in your application | [optional]
 **providerName** | [**Object**](.md)| The provider name | [optional]

### Return type

**Object**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

