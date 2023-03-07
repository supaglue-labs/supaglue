# swagger_client.SyncInfoApi

All URIs are relative to *https://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_sync_infos**](SyncInfoApi.md#get_sync_infos) | **GET** /sync-info | Get Sync Info

# **get_sync_infos**
> list[InlineResponse2004] get_sync_infos()

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
api_instance = swagger_client.SyncInfoApi()

try:
    # Get Sync Info
    api_response = api_instance.get_sync_infos()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling SyncInfoApi->get_sync_infos: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**list[InlineResponse2004]**](InlineResponse2004.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

