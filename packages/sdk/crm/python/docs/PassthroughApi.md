# swagger_client.PassthroughApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**send_passthrough_request**](PassthroughApi.md#send_passthrough_request) | **POST** /passthrough | Send passthrough request

# **send_passthrough_request**
> InlineResponse2005 send_passthrough_request(body, x_customer_id, x_provider_name)

Send passthrough request

Send request directly to a provider

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PassthroughApi()
body = swagger_client.PassthroughBody() # PassthroughBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name

try:
    # Send passthrough request
    api_response = api_instance.send_passthrough_request(body, x_customer_id, x_provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PassthroughApi->send_passthrough_request: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**PassthroughBody**](PassthroughBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 

### Return type

[**InlineResponse2005**](InlineResponse2005.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

