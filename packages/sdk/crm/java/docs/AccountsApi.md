# AccountsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAccount**](AccountsApi.md#createAccount) | **POST** /accounts | Create account
[**getAccount**](AccountsApi.md#getAccount) | **GET** /accounts/{account_id} | Get account
[**getAccounts**](AccountsApi.md#getAccounts) | **GET** /accounts | List accounts
[**searchAccounts**](AccountsApi.md#searchAccounts) | **POST** /accounts/_search | Search accounts
[**updateAccount**](AccountsApi.md#updateAccount) | **PATCH** /accounts/{account_id} | Update account

<a name="createAccount"></a>
# **createAccount**
> InlineResponse201 createAccount(body, xCustomerId, xProviderName)

Create account

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.AccountsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

AccountsApi apiInstance = new AccountsApi();
AccountsBody body = new AccountsBody(); // AccountsBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
try {
    InlineResponse201 result = apiInstance.createAccount(body, xCustomerId, xProviderName);
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
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getAccount"></a>
# **getAccount**
> Account getAccount(xCustomerId, xProviderName, accountId, expand)

Get account

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.AccountsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

AccountsApi apiInstance = new AccountsApi();
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String accountId = "accountId_example"; // String | 
String expand = "expand_example"; // String | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces
try {
    Account result = apiInstance.getAccount(xCustomerId, xProviderName, accountId, expand);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#getAccount");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **accountId** | **String**|  |
 **expand** | **String**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional]

### Return type

[**Account**](Account.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getAccounts"></a>
# **getAccounts**
> InlineResponse200 getAccounts(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize)

List accounts

Get a list of accounts

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.AccountsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

AccountsApi apiInstance = new AccountsApi();
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
    InlineResponse200 result = apiInstance.getAccounts(xCustomerId, xProviderName, createdAfter, createdBefore, modifiedAfter, modifiedBefore, cursor, expand, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#getAccounts");
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

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="searchAccounts"></a>
# **searchAccounts**
> InlineResponse200 searchAccounts(body, xCustomerId, xProviderName, cursor, pageSize)

Search accounts

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.AccountsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

AccountsApi apiInstance = new AccountsApi();
AccountsSearchBody body = new AccountsSearchBody(); // AccountsSearchBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String cursor = "cursor_example"; // String | The pagination cursor value
String pageSize = "pageSize_example"; // String | Number of results to return per page
try {
    InlineResponse200 result = apiInstance.searchAccounts(body, xCustomerId, xProviderName, cursor, pageSize);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AccountsApi#searchAccounts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsSearchBody**](AccountsSearchBody.md)|  |
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **cursor** | **String**| The pagination cursor value | [optional]
 **pageSize** | **String**| Number of results to return per page | [optional]

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="updateAccount"></a>
# **updateAccount**
> InlineResponse201 updateAccount(body, xCustomerId, xProviderName, accountId)

Update account

### Example
```java
// Import classes:
//import io.swagger.client.ApiClient;
//import io.swagger.client.ApiException;
//import io.swagger.client.Configuration;
//import io.swagger.client.auth.*;
//import io.swagger.client.api.AccountsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: ApiKeyAuth
ApiKeyAuth ApiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("ApiKeyAuth");
ApiKeyAuth.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//ApiKeyAuth.setApiKeyPrefix("Token");

AccountsApi apiInstance = new AccountsApi();
AccountsAccountIdBody body = new AccountsAccountIdBody(); // AccountsAccountIdBody | 
String xCustomerId = "xCustomerId_example"; // String | The customer ID that uniquely identifies the customer in your application
String xProviderName = "xProviderName_example"; // String | The provider name
String accountId = "accountId_example"; // String | 
try {
    InlineResponse201 result = apiInstance.updateAccount(body, xCustomerId, xProviderName, accountId);
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
 **xCustomerId** | **String**| The customer ID that uniquely identifies the customer in your application |
 **xProviderName** | **String**| The provider name |
 **accountId** | **String**|  |

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

