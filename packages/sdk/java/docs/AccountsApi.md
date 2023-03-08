# AccountsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAccount**](AccountsApi.md#createAccount) | **POST** /accounts | Create account
[**getAccount**](AccountsApi.md#getAccount) | **GET** /accounts/{account_id} | Get account
[**getAccounts**](AccountsApi.md#getAccounts) | **GET** /accounts | List accounts
[**updateAccount**](AccountsApi.md#updateAccount) | **PATCH** /accounts/{account_id} | Update account

<a name="createAccount"></a>
# **createAccount**
> InlineResponse201 createAccount(body, customerId, providerName)

Create account

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.AccountsApi;


AccountsApi apiInstance = new AccountsApi();
AccountsBody body = new AccountsBody(); // AccountsBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
try {
    InlineResponse201 result = apiInstance.createAccount(body, customerId, providerName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#createAccount");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsBody**](AccountsBody.md)|  |
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getAccount"></a>
# **getAccount**
> Account getAccount(customerId, providerName, accountId, expand)

Get account

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.AccountsApi;


AccountsApi apiInstance = new AccountsApi();
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String accountId = "accountId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Account result = apiInstance.getAccount(customerId, providerName, accountId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#getAccount");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **accountId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Account**](Account.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getAccounts"></a>
# **getAccounts**
> InlineResponse200 getAccounts(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize)

List accounts

Get a list of accounts

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.AccountsApi;


AccountsApi apiInstance = new AccountsApi();
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
    InlineResponse200 result = apiInstance.getAccounts(customerId, providerName, createdAfter, createdBefore, updatedAfter, updatedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#getAccounts");
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

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateAccount"></a>
# **updateAccount**
> InlineResponse201 updateAccount(body, customerId, providerName, accountId)

Update account

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.AccountsApi;


AccountsApi apiInstance = new AccountsApi();
AccountsAccountIdBody body = new AccountsAccountIdBody(); // AccountsAccountIdBody | 
String customerId = "customerId_example"; // String | The customer ID
String providerName = "providerName_example"; // String | The provider name
String accountId = "accountId_example"; // String | 
try {
    InlineResponse201 result = apiInstance.updateAccount(body, customerId, providerName, accountId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#updateAccount");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsAccountIdBody**](AccountsAccountIdBody.md)|  |
 **customerId** | **String**| The customer ID |
 **providerName** | **String**| The provider name |
 **accountId** | **String**|  |

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

