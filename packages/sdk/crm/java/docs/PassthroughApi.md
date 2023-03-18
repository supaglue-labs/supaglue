# PassthroughApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**sendPassthroughRequest**](PassthroughApi.md#sendPassthroughRequest) | **POST** /passthrough | Send passthrough request

<a name="sendPassthroughRequest"></a>
# **sendPassthroughRequest**
> InlineResponse2005 sendPassthroughRequest(body, xCustomerId, xProviderName)

Send passthrough request

Send request directly to a provider

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.PassthroughApi;


PassthroughApi apiInstance = new PassthroughApi();
PassthroughBody body = new PassthroughBody(); // PassthroughBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
try {
    InlineResponse2005 result = apiInstance.sendPassthroughRequest(body, xCustomerId, xProviderName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling PassthroughApi#sendPassthroughRequest");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**PassthroughBody**](PassthroughBody.md)|  |
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |

### Return type

[**InlineResponse2005**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

