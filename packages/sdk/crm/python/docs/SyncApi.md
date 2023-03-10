# swagger_client.SyncApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_sync_history**](SyncApi.md#get_sync_history) | **GET** /sync-history | Get Sync History
[**get_sync_infos**](SyncApi.md#get_sync_infos) | **GET** /sync-info | Get Sync Info

# **get_sync_history**
> InlineResponse2004 get_sync_history(customer_id, provider_name, cursor=cursor, page_size=page_size, model=model)

Get Sync History

Get a list of Sync History objects.

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SyncApi()
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name
cursor = 'cursor_example' # str | The pagination cursor value (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)
model = 'model_example' # str | The model name to filter by (optional)

try:
    # Get Sync History
    api_response = api_instance.get_sync_history(customer_id, provider_name, cursor=cursor, page_size=page_size, model=model)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SyncApi->get_sync_history: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 
 **model** | **str**| The model name to filter by | [optional] 

### Return type

[**InlineResponse2004**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_sync_infos**
> list[InlineResponse2005] get_sync_infos(customer_id, provider_name)

Get Sync Info

Get a list of Sync Info

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.SyncApi()
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name

try:
    # Get Sync Info
    api_response = api_instance.get_sync_infos(customer_id, provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SyncApi->get_sync_infos: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 

### Return type

[**list[InlineResponse2005]**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

