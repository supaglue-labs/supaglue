# swagger_client.IntegrationsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_integration**](IntegrationsApi.md#create_integration) | **POST** /integrations | Create integration
[**delete_integration**](IntegrationsApi.md#delete_integration) | **DELETE** /integrations/{integration_id} | Delete integration
[**get_integration**](IntegrationsApi.md#get_integration) | **GET** /integrations/{integration_id} | Get integration
[**get_integrations**](IntegrationsApi.md#get_integrations) | **GET** /integrations | List integrations
[**update_integration**](IntegrationsApi.md#update_integration) | **PUT** /integrations/{integration_id} | Update integration

# **create_integration**
> Integration create_integration(body)

Create integration

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.IntegrationsApi()
body = swagger_client.CreateUpdateIntegration() # CreateUpdateIntegration | 

try:
    # Create integration
    api_response = api_instance.create_integration(body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling IntegrationsApi->create_integration: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateIntegration**](CreateUpdateIntegration.md)|  | 

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_integration**
> Integration delete_integration(integration_id)

Delete integration

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.IntegrationsApi()
integration_id = 'integration_id_example' # str | 

try:
    # Delete integration
    api_response = api_instance.delete_integration(integration_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling IntegrationsApi->delete_integration: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integration_id** | **str**|  | 

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_integration**
> Integration get_integration(integration_id)

Get integration

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.IntegrationsApi()
integration_id = 'integration_id_example' # str | 

try:
    # Get integration
    api_response = api_instance.get_integration(integration_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling IntegrationsApi->get_integration: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integration_id** | **str**|  | 

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_integrations**
> list[Integration] get_integrations()

List integrations

Get a list of integrations

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.IntegrationsApi()

try:
    # List integrations
    api_response = api_instance.get_integrations()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling IntegrationsApi->get_integrations: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**list[Integration]**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_integration**
> Integration update_integration(body, integration_id)

Update integration

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.IntegrationsApi()
body = swagger_client.CreateUpdateIntegration() # CreateUpdateIntegration | 
integration_id = 'integration_id_example' # str | 

try:
    # Update integration
    api_response = api_instance.update_integration(body, integration_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling IntegrationsApi->update_integration: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateIntegration**](CreateUpdateIntegration.md)|  | 
 **integration_id** | **str**|  | 

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

