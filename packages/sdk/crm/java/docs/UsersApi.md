# UsersApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getUser**](UsersApi.md#getUser) | **GET** /users/{user_id} | Get user
[**getUsers**](UsersApi.md#getUsers) | **GET** /users | List users

<a name="getUser"></a>
# **getUser**
> User getUser(xCustomerId, xProviderName, userId)

Get user

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.UsersApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

UsersApi apiInstance = new UsersApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String userId = "userId_example"; // String | 
try {
    User result = apiInstance.getUser(xCustomerId, xProviderName, userId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling UsersApi#getUser");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **userId** | **String**|  |

### Return type

[**User**](User.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getUsers"></a>
# **getUsers**
> InlineResponse2004 getUsers(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize)

List users

Get a list of users

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.UsersApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

UsersApi apiInstance = new UsersApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
OffsetDateTime createdAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created after this datetime
OffsetDateTime createdBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created before this datetime
OffsetDateTime modifiedAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified after this datetime
OffsetDateTime modifiedBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified before this datetime
String cursor = "cursor_example"; // String | The pagination cursor value
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2004 result = apiInstance.getUsers(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling UsersApi#getUsers");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **createdAfter** | **OffsetDateTime**| If provided, will only return objects created after this datetime | [optional]
 **createdBefore** | **OffsetDateTime**| If provided, will only return objects created before this datetime | [optional]
 **modifiedAfter** | **OffsetDateTime**| If provided, will only return objects modified after this datetime | [optional]
 **modifiedBefore** | **OffsetDateTime**| If provided, will only return objects modified before this datetime | [optional]
 **cursor** | **String**| The pagination cursor value | [optional]
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

