# swagger_client.ContactsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_contact**](ContactsApi.md#create_contact) | **POST** /contacts | Create contact
[**get_contact**](ContactsApi.md#get_contact) | **GET** /contacts/{contact_id} | Get contact
[**get_contacts**](ContactsApi.md#get_contacts) | **GET** /contacts | List contacts
[**search_contacts**](ContactsApi.md#search_contacts) | **POST** /contacts/_search | Search contacts
[**update_contact**](ContactsApi.md#update_contact) | **PATCH** /contacts/{contact_id} | Update contact

# **create_contact**
> InlineResponse2011 create_contact(body, x_customer_id, x_provider_name)

Create contact

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
api_instance = swagger_client.ContactsApi(swagger_client.ApiClient(configuration))
body = swagger_client.ContactsBody() # ContactsBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name

try:
    # Create contact
    api_response = api_instance.create_contact(body, x_customer_id, x_provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ContactsApi->create_contact: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsBody**](ContactsBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_contact**
> Contact get_contact(x_customer_id, x_provider_name, contact_id, expand=expand)

Get contact

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
api_instance = swagger_client.ContactsApi(swagger_client.ApiClient(configuration))
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
contact_id = 'contact_id_example' # str | 
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)

try:
    # Get contact
    api_response = api_instance.get_contact(x_customer_id, x_provider_name, contact_id, expand=expand)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ContactsApi->get_contact: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **contact_id** | **str**|  | 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 

### Return type

[**Contact**](Contact.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_contacts**
> InlineResponse2001 get_contacts(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)

List contacts

Get a list of contacts

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
api_instance = swagger_client.ContactsApi(swagger_client.ApiClient(configuration))
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
    # List contacts
    api_response = api_instance.get_contacts(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ContactsApi->get_contacts: %s\n" % e)
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

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search_contacts**
> InlineResponse2001 search_contacts(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)

Search contacts

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
api_instance = swagger_client.ContactsApi(swagger_client.ApiClient(configuration))
body = swagger_client.ContactsSearchBody() # ContactsSearchBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
cursor = 'cursor_example' # str | The pagination cursor value (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)

try:
    # Search contacts
    api_response = api_instance.search_contacts(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ContactsApi->search_contacts: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsSearchBody**](ContactsSearchBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_contact**
> InlineResponse2011 update_contact(body, x_customer_id, x_provider_name, contact_id)

Update contact

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
api_instance = swagger_client.ContactsApi(swagger_client.ApiClient(configuration))
body = swagger_client.ContactsContactIdBody() # ContactsContactIdBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
contact_id = 'contact_id_example' # str | 

try:
    # Update contact
    api_response = api_instance.update_contact(body, x_customer_id, x_provider_name, contact_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ContactsApi->update_contact: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ContactsContactIdBody**](ContactsContactIdBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **contact_id** | **str**|  | 

### Return type

[**InlineResponse2011**](InlineResponse2011.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

