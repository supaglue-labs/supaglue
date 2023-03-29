# swagger_client.OpportunitiesApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_opportunity**](OpportunitiesApi.md#create_opportunity) | **POST** /opportunities | Create opportunity
[**get_opportunities**](OpportunitiesApi.md#get_opportunities) | **GET** /opportunities | List opportunities
[**get_opportunity**](OpportunitiesApi.md#get_opportunity) | **GET** /opportunities/{opportunity_id} | Get opportunity
[**search_opportunities**](OpportunitiesApi.md#search_opportunities) | **POST** /opportunities/_search | Search Opportunities
[**update_opportunity**](OpportunitiesApi.md#update_opportunity) | **PATCH** /opportunities/{opportunity_id} | Update opportunity

# **create_opportunity**
> InlineResponse2013 create_opportunity(body, x_customer_id, x_provider_name)

Create opportunity

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
api_instance = swagger_client.OpportunitiesApi(swagger_client.ApiClient(configuration))
body = swagger_client.OpportunitiesBody() # OpportunitiesBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name

try:
    # Create opportunity
    api_response = api_instance.create_opportunity(body, x_customer_id, x_provider_name)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OpportunitiesApi->create_opportunity: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**OpportunitiesBody**](OpportunitiesBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_opportunities**
> InlineResponse2003 get_opportunities(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)

List opportunities

Get a list of opportunities

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
api_instance = swagger_client.OpportunitiesApi(swagger_client.ApiClient(configuration))
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
    # List opportunities
    api_response = api_instance.get_opportunities(x_customer_id, x_provider_name, created_after=created_after, created_before=created_before, modified_after=modified_after, modified_before=modified_before, cursor=cursor, expand=expand, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OpportunitiesApi->get_opportunities: %s\n" % e)
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

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_opportunity**
> Opportunity get_opportunity(x_customer_id, x_provider_name, opportunity_id, expand=expand)

Get opportunity

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
api_instance = swagger_client.OpportunitiesApi(swagger_client.ApiClient(configuration))
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
opportunity_id = 'opportunity_id_example' # str | 
expand = 'expand_example' # str | Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces (optional)

try:
    # Get opportunity
    api_response = api_instance.get_opportunity(x_customer_id, x_provider_name, opportunity_id, expand=expand)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OpportunitiesApi->get_opportunity: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **opportunity_id** | **str**|  | 
 **expand** | **str**| Which relations should be returned in expanded form. Multiple relation names should be comma separated without spaces | [optional] 

### Return type

[**Opportunity**](Opportunity.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search_opportunities**
> InlineResponse2003 search_opportunities(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)

Search Opportunities

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
api_instance = swagger_client.OpportunitiesApi(swagger_client.ApiClient(configuration))
body = swagger_client.OpportunitiesSearchBody() # OpportunitiesSearchBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
cursor = 'cursor_example' # str | The pagination cursor value (optional)
page_size = 'page_size_example' # str | Number of results to return per page (optional)

try:
    # Search Opportunities
    api_response = api_instance.search_opportunities(body, x_customer_id, x_provider_name, cursor=cursor, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OpportunitiesApi->search_opportunities: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**OpportunitiesSearchBody**](OpportunitiesSearchBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **cursor** | **str**| The pagination cursor value | [optional] 
 **page_size** | **str**| Number of results to return per page | [optional] 

### Return type

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_opportunity**
> InlineResponse2013 update_opportunity(body, x_customer_id, x_provider_name, opportunity_id)

Update opportunity

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
api_instance = swagger_client.OpportunitiesApi(swagger_client.ApiClient(configuration))
body = swagger_client.OpportunitiesOpportunityIdBody() # OpportunitiesOpportunityIdBody | 
x_customer_id = 'x_customer_id_example' # str | The customer ID that uniquely identifies the customer in your application
x_provider_name = 'x_provider_name_example' # str | The provider name
opportunity_id = 'opportunity_id_example' # str | 

try:
    # Update opportunity
    api_response = api_instance.update_opportunity(body, x_customer_id, x_provider_name, opportunity_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling OpportunitiesApi->update_opportunity: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**OpportunitiesOpportunityIdBody**](OpportunitiesOpportunityIdBody.md)|  | 
 **x_customer_id** | **str**| The customer ID that uniquely identifies the customer in your application | 
 **x_provider_name** | **str**| The provider name | 
 **opportunity_id** | **str**|  | 

### Return type

[**InlineResponse2013**](InlineResponse2013.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

