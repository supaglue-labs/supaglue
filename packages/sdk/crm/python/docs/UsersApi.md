# swagger_client.UsersApi

All URIs are relative to *http://localhost:8080/crm/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_user**](UsersApi.md#get_user) | **GET** /users/{user_id} | Get user
[**get_users**](UsersApi.md#get_users) | **GET** /users | List users

# **get_user**
> User get_user(customer_id, provider_name, user_id)

Get user

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UsersApi()
customer_id = 'customer_id_example' # str | The customer ID
provider_name = 'provider_name_example' # str | The provider name
user_id = 'user_id_example' # str | 

try:
    # Get user
    api_response = api_instance.get_user(customer_id, provider_name, user_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UsersApi->get_user: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customer_id** | **str**| The customer ID | 
 **provider_name** | **str**| The provider name | 
 **user_id** | **str**|  | 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_users**
> InlineResponse2003 get_users(customer_id, provider_name, created_after=created_after, created_before=created_before, updated_after=updated_after, updated_before=updated_before, cursor=cursor, expand=expand, page_size=page_size)

List users

Get a list of users

### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UsersApi()
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
    # List users
    api_response = api_instance.get_users(customer_id, provider_name, created_after=created_after, created_before=created_before, updated_after=updated_after, updated_before=updated_before, cursor=cursor, expand=expand, page_size=page_size)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UsersApi->get_users: %s\n" % e)
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

[**InlineResponse2003**](InlineResponse2003.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

