# SyncApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSyncHistory**](SyncApi.md#getSyncHistory) | **GET** /sync-history | Get Sync History
[**getSyncInfos**](SyncApi.md#getSyncInfos) | **GET** /sync-info | Get Sync Info

<a name="getSyncHistory"></a>
# **getSyncHistory**
> InlineResponse2004 getSyncHistory(customerId, providerName, cursor, pageSize, model)

Get Sync History

Get a list of Sync History objects.

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SyncApi;


SyncApi apiInstance = new SyncApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String cursor = "cursor_example"; // String | The pagination cursor value
String pageSize = "pageSize_example"; // String | Number of results to return per page
String model = "model_example"; // String | The model name to filter by
try {
    InlineResponse2004 result = apiInstance.getSyncHistory(customerId, providerName, cursor, pageSize, model);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncHistory");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **cursor** | **String**| The pagination cursor value | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]
 **model** | **String**| The model name to filter by | [optional]

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSyncInfos"></a>
# **getSyncInfos**
> List&lt;InlineResponse2005&gt; getSyncInfos(customerId, providerName)

Get Sync Info

Get a list of Sync Info

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SyncApi;


SyncApi apiInstance = new SyncApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
try {
    List<InlineResponse2005> result = apiInstance.getSyncInfos(customerId, providerName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncApi#getSyncInfos");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |

### Return type

[**List&lt;InlineResponse2005&gt;**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

