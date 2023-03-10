# swagger_client.LeadsApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_lead**](LeadsApi.md#create_lead) | **POST** /leads | Create lead
[**get_lead**](LeadsApi.md#get_lead) | **GET** /leads/{lead_id} | Get lead
[**get_leads**](LeadsApi.md#get_leads) | **GET** /leads | List leads
[**update_lead**](LeadsApi.md#update_lead) | **PATCH** /leads/{lead_id} | Update lead

# **create_lead**
> InlineResponse2012 create_lead(body, customer_id, provider_name)

Create lead

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.LeadsApi()
body = swagger_client.LeadsBody() # LeadsBody | 
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name

try:
    # Create lead
    api_response = api_instance.create_lead(body, customer_id, provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LeadsApi->create_lead: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**LeadsBody**](LeadsBody.md)|  | 
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 

### Return type

[**InlineResponse2012**](InlineResponse2012.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_lead**
> Lead get_lead(customer_id, provider_name, lead_id, expand=expand)

Get lead

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.LeadsApi()
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name
lead_id = 'lead_id_example' # str | 
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)

try:
    # Get lead
    api_response = api_instance.get_lead(customer_id, provider_name, lead_id, expand=expand)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LeadsApi->get_lead: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 
 **lead_id** | **str**|  | 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 

### Return type

[**Lead**](Lead.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_leads**
> InlineResponse2002 get_leads(customer_id, provider_name, created_after=created_after, created_before=created_before, updated_after=updated_after, updated_before=updated_before, cursor=cursor, expand=expand, page_size=page_size)

List leads

Get a list of leads

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.LeadsApi()
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name
created_after = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects created after this datetime (optional)
created_before = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects created before this datetime (optional)
updated_after = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects modified after this datetime (optional)
updated_before = '2013-10-20T19:20:30+01:00' # datetime | If provided, will only return objects modified before this datetime (optional)
cursor = 'cursor_example' # str | The pagination cursor value (optional)
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)

try:
    # List leads
    api_response = api_instance.get_leads(customer_id, provider_name, created_after=created_after, created_before=created_before, updated_after=updated_after, updated_before=updated_before, cursor=cursor, expand=expand, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LeadsApi->get_leads: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 
 **created_after** | **datetime**| If provided, will only return objects created after this datetime | [optional] 
 **created_before** | **datetime**| If provided, will only return objects created before this datetime | [optional] 
 **updated_after** | **datetime**| If provided, will only return objects modified after this datetime | [optional] 
 **updated_before** | **datetime**| If provided, will only return objects modified before this datetime | [optional] 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 

### Return type

[**InlineResponse2002**](InlineResponse2002.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_lead**
> InlineResponse2012 update_lead(body, customer_id, provider_name, lead_id)

Update lead

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.LeadsApi()
body = swagger_client.LeadsLeadIdBody() # LeadsLeadIdBody | 
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name
lead_id = 'lead_id_example' # str | 

try:
    # Update lead
    api_response = api_instance.update_lead(body, customer_id, provider_name, lead_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LeadsApi->update_lead: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**LeadsLeadIdBody**](LeadsLeadIdBody.md)|  | 
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 
 **lead_id** | **str**|  | 

### Return type

[**InlineResponse2012**](InlineResponse2012.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

