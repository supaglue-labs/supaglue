# ContactsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createContact**](ContactsApi.md#createContact) | **POST** /contacts | Create contact
[**getContact**](ContactsApi.md#getContact) | **GET** /contacts/{contact_id} | Get contact
[**getContacts**](ContactsApi.md#getContacts) | **GET** /contacts | List contacts
[**updateContact**](ContactsApi.md#updateContact) | **PATCH** /contacts/{contact_id} | Update contact

<a name="createContact"></a>
# **createContact**
> InlineResponse2011 createContact(body, customerId, providerName)

Create contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContactsApi;


ContactsApi apiInstance = new ContactsApi();
ContactsBody body = new ContactsBody(); // ContactsBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
try {
    InlineResponse2011 result = apiInstance.createContact(body, customerId, providerName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#createContact");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsBody**](ContactsBody.md)|  |
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getContact"></a>
# **getContact**
> Contact getContact(customerId, providerName, contactId, expand)

Get contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContactsApi;


ContactsApi apiInstance = new ContactsApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String contactId = "contactId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Contact result = apiInstance.getContact(customerId, providerName, contactId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#getContact");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **contactId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Contact**](Contact.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getContacts"></a>
# **getContacts**
> InlineResponse2001 getContacts(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List contacts

Get a list of contacts

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContactsApi;


ContactsApi apiInstance = new ContactsApi();
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
    InlineResponse2001 result = apiInstance.getContacts(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#getContacts");
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

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateContact"></a>
# **updateContact**
> InlineResponse2011 updateContact(body, customerId, providerName, contactId)

Update contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContactsApi;


ContactsApi apiInstance = new ContactsApi();
ContactsContactIdBody body = new ContactsContactIdBody(); // ContactsContactIdBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String contactId = "contactId_example"; // String | 
try {
    InlineResponse2011 result = apiInstance.updateContact(body, customerId, providerName, contactId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#updateContact");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsContactIdBody**](ContactsContactIdBody.md)|  |
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **contactId** | **String**|  |

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

