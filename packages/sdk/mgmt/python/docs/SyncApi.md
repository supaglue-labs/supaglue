# swagger_client.SyncApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_sync_history**](SyncApi.md#get_sync_history) | **GET** /sync-history | Get Sync History
[**get_sync_infos**](SyncApi.md#get_sync_infos) | **GET** /sync-info | Get Sync Info

# **get_sync_history**
> object get_sync_history(cursor=cursor, page_size=page_size, customer_id=customer_id, provider_name=provider_name, model=model)

Get Sync History

Get a list of Sync History objects.

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
api_instance = swagger_client.SyncApi(swagger_client.ApiClient(configuration))
cursor = NULL # object | The pagination cursor value (optional)
page_size = NULL # object | Number of results to return per page (optional)
customer_id = NULL # object | The customer ID that uniquely identifies the customer in your application (optional)
provider_name = NULL # object | The provider name (optional)
model = NULL # object | The model name to filter by (optional)

try:
    # Get Sync History
    api_response = api_instance.get_sync_history(cursor=cursor, page_size=page_size, customer_id=customer_id, provider_name=provider_name, model=model)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SyncApi->get_sync_history: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | [**object**](.md)| The pagination cursor value | [optional] 
 **page_size** | [**object**](.md)| Number of results to return per page | [optional] 
 **customer_id** | [**object**](.md)| The customer ID that uniquely identifies the customer in your application | [optional] 
 **provider_name** | [**object**](.md)| The provider name | [optional] 
 **model** | [**object**](.md)| The model name to filter by | [optional] 

### Return type

**object**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_sync_infos**
> object get_sync_infos(customer_id=customer_id, provider_name=provider_name)

Get Sync Info

Get a list of Sync Info

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
api_instance = swagger_client.SyncApi(swagger_client.ApiClient(configuration))
customer_id = NULL # object | The customer ID that uniquely identifies the customer in your application (optional)
provider_name = NULL # object | The provider name (optional)

try:
    # Get Sync Info
    api_response = api_instance.get_sync_infos(customer_id=customer_id, provider_name=provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SyncApi->get_sync_infos: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | [**object**](.md)| The customer ID that uniquely identifies the customer in your application | [optional] 
 **provider_name** | [**object**](.md)| The provider name | [optional] 

### Return type

**object**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

