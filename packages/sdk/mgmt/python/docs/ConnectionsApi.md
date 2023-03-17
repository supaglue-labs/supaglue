# swagger_client.ConnectionsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**delete_connection**](ConnectionsApi.md#delete_connection) | **DELETE** /applications/{application_id}/customers/{customer_id}/connections/{connection_id} | Delete connection
[**get_connection**](ConnectionsApi.md#get_connection) | **GET** /applications/{application_id}/customers/{customer_id}/connections/{connection_id} | Get connection
[**get_connections**](ConnectionsApi.md#get_connections) | **GET** /applications/{application_id}/customers/{customer_id}/connections | List connections

# **delete_connection**
> Connection delete_connection(application_id, customer_id, connection_id)

Delete connection

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ConnectionsApi()
application_id = 'application_id_example' # str | 
customer_id = 'customer_id_example' # str | 
connection_id = 'connection_id_example' # str | 

try:
    # Delete connection
    api_response = api_instance.delete_connection(application_id, customer_id, connection_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ConnectionsApi->delete_connection: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 
 **customer_id** | **str**|  | 
 **connection_id** | **str**|  | 

### Return type

[**Connection**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_connection**
> Connection get_connection(application_id, customer_id, connection_id)

Get connection

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ConnectionsApi()
application_id = 'application_id_example' # str | 
customer_id = 'customer_id_example' # str | 
connection_id = 'connection_id_example' # str | 

try:
    # Get connection
    api_response = api_instance.get_connection(application_id, customer_id, connection_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ConnectionsApi->get_connection: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 
 **customer_id** | **str**|  | 
 **connection_id** | **str**|  | 

### Return type

[**Connection**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_connections**
> list[Connection] get_connections(application_id, customer_id)

List connections

Get a list of connections

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ConnectionsApi()
application_id = 'application_id_example' # str | 
customer_id = 'customer_id_example' # str | 

try:
    # List connections
    api_response = api_instance.get_connections(application_id, customer_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ConnectionsApi->get_connections: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 
 **customer_id** | **str**|  | 

### Return type

[**list[Connection]**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

