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
> InlineResponse2013 createOpportunity(body, customerId, providerName)

Create opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesBody body = new OpportunitiesBody(); // OpportunitiesBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
try {
    InlineResponse2013 result = apiInstance.createOpportunity(body, customerId, providerName);
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
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getOpportunities"></a>
# **getOpportunities**
> InlineResponse2004 getOpportunities(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List opportunities

Get a list of opportunities

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
OffsetDateTime createdAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created after this datetime
OffsetDateTime createdBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created before this datetime
OffsetDateTime updatedAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified after this datetime
OffsetDateTime updatedBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified before this datetime
String cursor = "cursor_example"; // String | The pagination cursor value
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2004 result = apiInstance.getOpportunities(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunities");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **createdAfter** | **OffsetDateTime**| If provided, will only return objects created after this datetime | [optional]
 **createdBefore** | **OffsetDateTime**| If provided, will only return objects created before this datetime | [optional]
 **updatedAfter** | **OffsetDateTime**| If provided, will only return objects modified after this datetime | [optional]
 **updatedBefore** | **OffsetDateTime**| If provided, will only return objects modified before this datetime | [optional]
 **cursor** | **String**| The pagination cursor value | [optional]
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOpportunity"></a>
# **getOpportunity**
> Opportunity getOpportunity(customerId, providerName, opportunityId, expand)

Get opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String opportunityId = "opportunityId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Opportunity result = apiInstance.getOpportunity(customerId, providerName, opportunityId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **opportunityId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Opportunity**](Opportunity.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateOpportunity"></a>
# **updateOpportunity**
> InlineResponse2013 updateOpportunity(body, customerId, providerName, opportunityId)

Update opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesOpportunityIdBody body = new OpportunitiesOpportunityIdBody(); // OpportunitiesOpportunityIdBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String opportunityId = "opportunityId_example"; // String | 
try {
    InlineResponse2013 result = apiInstance.updateOpportunity(body, customerId, providerName, opportunityId);
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
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **opportunityId** | **String**|  |

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

