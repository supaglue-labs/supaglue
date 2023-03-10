# swagger_client.ApplicationsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_application**](ApplicationsApi.md#create_application) | **POST** /applications | Create application
[**delete_application**](ApplicationsApi.md#delete_application) | **DELETE** /applications/{application_id} | Delete application
[**get_application**](ApplicationsApi.md#get_application) | **GET** /applications/{application_id} | Get application
[**get_applications**](ApplicationsApi.md#get_applications) | **GET** /applications | List applications
[**update_application**](ApplicationsApi.md#update_application) | **PUT** /applications/{application_id} | Update application

# **create_application**
> Application create_application(body)

Create application

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationsApi()
body = swagger_client.CreateUpdateApplication() # CreateUpdateApplication | 

try:
    # Create application
    api_response = api_instance.create_application(body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationsApi->create_application: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateApplication**](CreateUpdateApplication.md)|  | 

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_application**
> Application delete_application(application_id)

Delete application

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationsApi()
application_id = 'application_id_example' # str | 

try:
    # Delete application
    api_response = api_instance.delete_application(application_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationsApi->delete_application: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_application**
> Application get_application(application_id)

Get application

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationsApi()
application_id = 'application_id_example' # str | 

try:
    # Get application
    api_response = api_instance.get_application(application_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationsApi->get_application: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_applications**
> list[Application] get_applications()

List applications

Get a list of applications

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationsApi()

try:
    # List applications
    api_response = api_instance.get_applications()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationsApi->get_applications: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**list[Application]**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_application**
> Application update_application(body, application_id)

Update application

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ApplicationsApi()
body = swagger_client.CreateUpdateApplication() # CreateUpdateApplication | 
application_id = 'application_id_example' # str | 

try:
    # Update application
    api_response = api_instance.update_application(body, application_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ApplicationsApi->update_application: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateApplication**](CreateUpdateApplication.md)|  | 
 **application_id** | **str**|  | 

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

