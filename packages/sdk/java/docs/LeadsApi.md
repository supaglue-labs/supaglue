# LeadsApi

All URIs are relative to *https://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createLead**](LeadsApi.md#createLead) | **POST** /leads | Create lead
[**getLead**](LeadsApi.md#getLead) | **GET** /leads/{lead_id} | Get lead
[**getLeads**](LeadsApi.md#getLeads) | **GET** /leads | List leads
[**updateLead**](LeadsApi.md#updateLead) | **PATCH** /leads/{lead_id} | Update lead

<a name="createLead"></a>
# **createLead**
> InlineResponse2012 createLead(body)

Create lead

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.LeadsApi;


LeadsApi apiInstance = new LeadsApi();
LeadsBody body = new LeadsBody(); // LeadsBody | 
try {
    InlineResponse2012 result = apiInstance.createLead(body);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling LeadsApi#createLead");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**LeadsBody**](LeadsBody.md)|  |

### Return type

[**InlineResponse2012**](InlineResponse2012.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getLead"></a>
# **getLead**
> Lead getLead(leadId, expand)

Get lead

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.LeadsApi;


LeadsApi apiInstance = new LeadsApi();
String leadId = "leadId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Lead result = apiInstance.getLead(leadId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling LeadsApi#getLead");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **leadId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Lead**](Lead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getLeads"></a>
# **getLeads**
> InlineResponse2002 getLeads(createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List leads

Get a list of leads

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.LeadsApi;


LeadsApi apiInstance = new LeadsApi();
OffsetDateTime createdAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created after this datetime
OffsetDateTime createdBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects created before this datetime
OffsetDateTime updatedAfter = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified after this datetime
OffsetDateTime updatedBefore = new OffsetDateTime(); // OffsetDateTime | If provided, will only return objects modified before this datetime
String cursor = "cursor_example"; // String | The pagination cursor value
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2002 result = apiInstance.getLeads(createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling LeadsApi#getLeads");
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

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateLead"></a>
# **updateLead**
> InlineResponse2012 updateLead(body, leadId)

Update lead

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.LeadsApi;


LeadsApi apiInstance = new LeadsApi();
LeadsLeadIdBody body = new LeadsLeadIdBody(); // LeadsLeadIdBody | 
String leadId = "leadId_example"; // String | 
try {
    InlineResponse2012 result = apiInstance.updateLead(body, leadId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling LeadsApi#updateLead");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**LeadsLeadIdBody**](LeadsLeadIdBody.md)|  |
 **leadId** | **String**|  |

### Return type

[**InlineResponse2012**](InlineResponse2012.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

