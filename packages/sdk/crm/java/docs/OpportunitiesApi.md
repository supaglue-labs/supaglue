# OpportunitiesApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createOpportunity**](OpportunitiesApi.md#createOpportunity) | **POST** /opportunities | Create opportunity
[**getOpportunities**](OpportunitiesApi.md#getOpportunities) | **GET** /opportunities | List opportunities
[**getOpportunity**](OpportunitiesApi.md#getOpportunity) | **GET** /opportunities/{opportunity_id} | Get opportunity
[**updateOpportunity**](OpportunitiesApi.md#updateOpportunity) | **PATCH** /opportunities/{opportunity_id} | Update opportunity

<a name="createOpportunity"></a>
# **createOpportunity**
> InlineResponse2013 createOpportunity(body, xCustomerId, xProviderName)

Create opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.OpportunitiesApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesBody body = new OpportunitiesBody(); // OpportunitiesBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
try {
    InlineResponse2013 result = apiInstance.createOpportunity(body, xCustomerId, xProviderName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#createOpportunity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**OpportunitiesBody**](OpportunitiesBody.md)|  |
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getOpportunities"></a>
# **getOpportunities**
> InlineResponse2003 getOpportunities(xCustomerId, xProviderName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List opportunities

Get a list of opportunities

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.OpportunitiesApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

OpportunitiesApi apiInstance = new OpportunitiesApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
OffsetDateTime createdAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created after this datetime
OffsetDateTime createdBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created before this datetime
OffsetDateTime updatedAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified after this datetime
OffsetDateTime updatedBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified before this datetime
String cursor = "cursor_example"; // String | The pagination cursor value
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2003 result = apiInstance.getOpportunities(xCustomerId, xProviderName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunities");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |
 **createdAfter** | **OffsetDateTime**| If provided, will only return objects created after this datetime | [optional]
 **createdBefore** | **OffsetDateTime**| If provided, will only return objects created before this datetime | [optional]
 **updatedAfter** | **OffsetDateTime**| If provided, will only return objects modified after this datetime | [optional]
 **updatedBefore** | **OffsetDateTime**| If provided, will only return objects modified before this datetime | [optional]
 **cursor** | **String**| The pagination cursor value | [optional]
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]

### Return type

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOpportunity"></a>
# **getOpportunity**
> Opportunity getOpportunity(xCustomerId, xProviderName, opportunityId, expand)

Get opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.OpportunitiesApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

OpportunitiesApi apiInstance = new OpportunitiesApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
String opportunityId = "opportunityId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Opportunity result = apiInstance.getOpportunity(xCustomerId, xProviderName, opportunityId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |
 **opportunityId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Opportunity**](Opportunity.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateOpportunity"></a>
# **updateOpportunity**
> InlineResponse2013 updateOpportunity(body, xCustomerId, xProviderName, opportunityId)

Update opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.OpportunitiesApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesOpportunityIdBody body = new OpportunitiesOpportunityIdBody(); // OpportunitiesOpportunityIdBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID
String xProviderName = "xProviderName_example"; // String | The provider name
String opportunityId = "opportunityId_example"; // String | 
try {
    InlineResponse2013 result = apiInstance.updateOpportunity(body, xCustomerId, xProviderName, opportunityId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#updateOpportunity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**OpportunitiesOpportunityIdBody**](OpportunitiesOpportunityIdBody.md)|  |
 **xCustomerId** | **String**| The customer ID |
 **xProviderName** | **String**| The provider name |
 **opportunityId** | **String**|  |

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

