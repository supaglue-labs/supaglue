# OpportunitiesApi

All URIs are relative to *https://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createOpportunity**](OpportunitiesApi.md#createOpportunity) | **POST** /opportunities | Create opportunity
[**getOpportunities**](OpportunitiesApi.md#getOpportunities) | **GET** /opportunities | List opportunities
[**getOpportunity**](OpportunitiesApi.md#getOpportunity) | **GET** /opportunities/{opportunity_id} | Get opportunity
[**updateOpportunity**](OpportunitiesApi.md#updateOpportunity) | **PATCH** /opportunities/{opportunity_id} | Update opportunity

<a name="createOpportunity"></a>
# **createOpportunity**
> InlineResponse2013 createOpportunity(body)

Create opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesBody body = new OpportunitiesBody(); // OpportunitiesBody | 
try {
    InlineResponse2013 result = apiInstance.createOpportunity(body);
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

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getOpportunities"></a>
# **getOpportunities**
> InlineResponse2003 getOpportunities(createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List opportunities

Get a list of opportunities

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
OffsetDateTime createdAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created after this datetime
OffsetDateTime createdBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created before this datetime
OffsetDateTime updatedAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified after this datetime
OffsetDateTime updatedBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified before this datetime
String cursor = "cursor_example"; // String | The pagination cursor value
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2003 result = apiInstance.getOpportunities(createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunities");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getOpportunity"></a>
# **getOpportunity**
> Opportunity getOpportunity(opportunityId, expand)

Get opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
String opportunityId = "opportunityId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Opportunity result = apiInstance.getOpportunity(opportunityId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling OpportunitiesApi#getOpportunity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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
> InlineResponse2013 updateOpportunity(body, opportunityId)

Update opportunity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.OpportunitiesApi;


OpportunitiesApi apiInstance = new OpportunitiesApi();
OpportunitiesOpportunityIdBody body = new OpportunitiesOpportunityIdBody(); // OpportunitiesOpportunityIdBody | 
String opportunityId = "opportunityId_example"; // String | 
try {
    InlineResponse2013 result = apiInstance.updateOpportunity(body, opportunityId);
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
 **opportunityId** | **String**|  |

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

