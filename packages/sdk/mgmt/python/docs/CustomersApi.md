# swagger_client.CustomersApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_customer**](CustomersApi.md#create_customer) | **POST** /applications/{application_id}/customers | Create customer
[**delete_customer**](CustomersApi.md#delete_customer) | **DELETE** /applications/{application_id}/customers/{customer_id} | Delete customer
[**get_customer**](CustomersApi.md#get_customer) | **GET** /applications/{application_id}/customers/{customer_id} | Get customer
[**get_customers**](CustomersApi.md#get_customers) | **GET** /applications/{application_id}/customers | List customers

# **create_customer**
> Customer create_customer(body, application_id)

Create customer

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.CustomersApi()
body = swagger_client.CreateUpdateCustomer() # CreateUpdateCustomer | 
application_id = 'application_id_example' # str | 

try:
    # Create customer
    api_response = api_instance.create_customer(body, application_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling CustomersApi->create_customer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateCustomer**](CreateUpdateCustomer.md)|  | 
 **application_id** | **str**|  | 

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_customer**
> Customer delete_customer(application_id, customer_id)

Delete customer

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.CustomersApi()
application_id = 'application_id_example' # str | 
customer_id = 'customer_id_example' # str | 

try:
    # Delete customer
    api_response = api_instance.delete_customer(application_id, customer_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling CustomersApi->delete_customer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 
 **customer_id** | **str**|  | 

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_customer**
> Customer get_customer(application_id, customer_id)

Get customer

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.CustomersApi()
application_id = 'application_id_example' # str | 
customer_id = 'customer_id_example' # str | 

try:
    # Get customer
    api_response = api_instance.get_customer(application_id, customer_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling CustomersApi->get_customer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 
 **customer_id** | **str**|  | 

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_customers**
> list[Customer] get_customers(application_id)

List customers

Get a list of customers

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.CustomersApi()
application_id = 'application_id_example' # str | 

try:
    # List customers
    api_response = api_instance.get_customers(application_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling CustomersApi->get_customers: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **application_id** | **str**|  | 

### Return type

[**list[Customer]**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

