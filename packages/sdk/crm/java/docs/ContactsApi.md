# ContactsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createContact**](ContactsApi.md#createContact) | **POST** /contacts | Create contact
[**getContact**](ContactsApi.md#getContact) | **GET** /contacts/{contact_id} | Get contact
[**getContacts**](ContactsApi.md#getContacts) | **GET** /contacts | List contacts
[**searchContacts**](ContactsApi.md#searchContacts) | **POST** /contacts/_search | Search contacts
[**updateContact**](ContactsApi.md#updateContact) | **PATCH** /contacts/{contact_id} | Update contact

<a name="createContact"></a>
# **createContact**
> InlineResponse2011 createContact(body, xCustomerId, xProviderName)

Create contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.ContactsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

ContactsApi apiInstance = new ContactsApi();
ContactsBody body = new ContactsBody(); // ContactsBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
try {
    InlineResponse2011 result = apiInstance.createContact(body, xCustomerId, xProviderName);
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
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getContact"></a>
# **getContact**
> Contact getContact(xCustomerId, xProviderName, contactId, expand)

Get contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.ContactsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

ContactsApi apiInstance = new ContactsApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String contactId = "contactId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Contact result = apiInstance.getContact(xCustomerId, xProviderName, contactId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#getContact");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **contactId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Contact**](Contact.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getContacts"></a>
# **getContacts**
> InlineResponse2001 getContacts(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize)

List contacts

Get a list of contacts

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.ContactsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

ContactsApi apiInstance = new ContactsApi();
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
    InlineResponse2001 result = apiInstance.getContacts(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#getContacts");
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

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="searchContacts"></a>
# **searchContacts**
> InlineResponse2001 searchContacts(body, xCustomerId, xProviderName, cursor, pageSize)

Search contacts

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.ContactsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

ContactsApi apiInstance = new ContactsApi();
ContactsSearchBody body = new ContactsSearchBody(); // ContactsSearchBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String cursor = "cursor_example"; // String | The pagination cursor value
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse2001 result = apiInstance.searchContacts(body, xCustomerId, xProviderName, cursor, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ContactsApi#searchContacts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsSearchBody**](ContactsSearchBody.md)|  |
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **cursor** | **String**| The pagination cursor value | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateContact"></a>
# **updateContact**
> InlineResponse2011 updateContact(body, xCustomerId, xProviderName, contactId)

Update contact

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.ContactsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

ContactsApi apiInstance = new ContactsApi();
ContactsContactIdBody body = new ContactsContactIdBody(); // ContactsContactIdBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String contactId = "contactId_example"; // String | 
try {
    InlineResponse2011 result = apiInstance.updateContact(body, xCustomerId, xProviderName, contactId);
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
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **contactId** | **String**|  |

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

