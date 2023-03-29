# swagger_client.AccountsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_account**](AccountsApi.md#create_account) | **POST** /accounts | Create account
[**get_account**](AccountsApi.md#get_account) | **GET** /accounts/{account_id} | Get account
[**get_accounts**](AccountsApi.md#get_accounts) | **GET** /accounts | List accounts
[**search_accounts**](AccountsApi.md#search_accounts) | **POST** /accounts/_search | Search accounts
[**update_account**](AccountsApi.md#update_account) | **PATCH** /accounts/{account_id} | Update account

# **create_account**
> InlineResponse201 create_account(body, x_customer_id, x_provider_name)

Create account

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['x-api-key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['x-api-key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.AccountsApi(swagger_client.ApiClient(configuration))
body = swagger_client.AccountsBody() # AccountsBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name

try:
    # Create account
    api_response = api_instance.create_account(body, x_customer_id, x_provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccountsApi->create_account: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsBody**](AccountsBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_account**
> Account get_account(x_customer_id, x_provider_name, account_id, expand=expand)

Get account

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['x-api-key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['x-api-key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.AccountsApi(swagger_client.ApiClient(configuration))
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
account_id = 'account_id_example' # str | 
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)

try:
    # Get account
    api_response = api_instance.get_account(x_customer_id, x_provider_name, account_id, expand=expand)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccountsApi->get_account: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **account_id** | **str**|  | 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 

### Return type

[**Account**](Account.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_accounts**
> InlineResponse200 get_accounts(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)

List accounts

Get a list of accounts

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['x-api-key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['x-api-key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.AccountsApi(swagger_client.ApiClient(configuration))
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
created_after = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects created after this datetime (optional)
created_before = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects created before this datetime (optional)
modified_after = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects modified after this datetime (optional)
modified_before = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects modified before this datetime (optional)
cursor = 'cursor_example' # str | The pagination cursor value (optional)
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)

try:
    # List accounts
    api_response = api_instance.get_accounts(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccountsApi->get_accounts: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **created_after** | **datetime**| If provided, will only return objects created after this datetime | [optional] 
 **created_before** | **datetime**| If provided, will only return objects created before this datetime | [optional] 
 **modified_after** | **datetime**| If provided, will only return objects modified after this datetime | [optional] 
 **modified_before** | **datetime**| If provided, will only return objects modified before this datetime | [optional] 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search_accounts**
> InlineResponse200 search_accounts(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)

Search accounts

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['x-api-key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['x-api-key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.AccountsApi(swagger_client.ApiClient(configuration))
body = swagger_client.AccountsSearchBody() # AccountsSearchBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
cursor = 'cursor_example' # str | The pagination cursor value (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)

try:
    # Search accounts
    api_response = api_instance.search_accounts(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccountsApi->search_accounts: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsSearchBody**](AccountsSearchBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_account**
> InlineResponse201 update_account(body, x_customer_id, x_provider_name, account_id)

Update account

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: ApiKeyAuth
configuration = swagger_client.Configuration()
configuration.api_key['x-api-key'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['x-api-key'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.AccountsApi(swagger_client.ApiClient(configuration))
body = swagger_client.AccountsAccountIdBody() # AccountsAccountIdBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
account_id = 'account_id_example' # str | 

try:
    # Update account
    api_response = api_instance.update_account(body, x_customer_id, x_provider_name, account_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling AccountsApi->update_account: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**AccountsAccountIdBody**](AccountsAccountIdBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **account_id** | **str**|  | 

### Return type

[**InlineResponse201**](InlineResponse201.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

