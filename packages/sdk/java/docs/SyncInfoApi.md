# SyncInfoApi

All URIs are relative to *https://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSyncInfos**](SyncInfoApi.md#getSyncInfos) | **GET** /sync-info | Get Sync Info

<a name="getSyncInfos"></a>
# **getSyncInfos**
> List&lt;InlineResponse2004&gt; getSyncInfos()

Get Sync Info

Get a list of Sync Info

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SyncInfoApi;


SyncInfoApi apiInstance = new SyncInfoApi();
try {
    List<InlineResponse2004> result = apiInstance.getSyncInfos();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SyncInfoApi#getSyncInfos");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;InlineResponse2004&gt;**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

