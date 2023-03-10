# CustomersApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createCustomer**](CustomersApi.md#createCustomer) | **POST** /applications/{application_id}/customers | Create customer
[**deleteCustomer**](CustomersApi.md#deleteCustomer) | **DELETE** /applications/{application_id}/customers/{customer_id} | Delete customer
[**getCustomer**](CustomersApi.md#getCustomer) | **GET** /applications/{application_id}/customers/{customer_id} | Get customer
[**getCustomers**](CustomersApi.md#getCustomers) | **GET** /applications/{application_id}/customers | List customers

<a name="createCustomer"></a>
# **createCustomer**
> Customer createCustomer(body, applicationId)

Create customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
CreateUpdateCustomer body = new CreateUpdateCustomer(); // CreateUpdateCustomer | 
String applicationId = "applicationId_example"; // String | 
try {
    Customer result = apiInstance.createCustomer(body, applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#createCustomer");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateCustomer**](CreateUpdateCustomer.md)|  |
 **applicationId** | **String**|  |

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteCustomer"></a>
# **deleteCustomer**
> Customer deleteCustomer(applicationId, customerId)

Delete customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
String applicationId = "applicationId_example"; // String | 
String customerId = "customerId_example"; // String | 
try {
    Customer result = apiInstance.deleteCustomer(applicationId, customerId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#deleteCustomer");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |
 **customerId** | **String**|  |

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getCustomer"></a>
# **getCustomer**
> Customer getCustomer(applicationId, customerId)

Get customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
String applicationId = "applicationId_example"; // String | 
String customerId = "customerId_example"; // String | 
try {
    Customer result = apiInstance.getCustomer(applicationId, customerId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#getCustomer");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |
 **customerId** | **String**|  |

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getCustomers"></a>
# **getCustomers**
> List&lt;Customer&gt; getCustomers(applicationId)

List customers

Get a list of customers

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
String applicationId = "applicationId_example"; // String | 
try {
    List<Customer> result = apiInstance.getCustomers(applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#getCustomers");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |

### Return type

[**List&lt;Customer&gt;**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

