# CustomersApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createCustomer**](CustomersApi.md#createCustomer) | **POST** /customers | Create customer
[**deleteCustomer**](CustomersApi.md#deleteCustomer) | **DELETE** /customers/{customer_id} | Delete customer
[**getCustomer**](CustomersApi.md#getCustomer) | **GET** /customers/{customer_id} | Get customer
[**getCustomers**](CustomersApi.md#getCustomers) | **GET** /customers | List customers

<a name="createCustomer"></a>
# **createCustomer**
> Customer createCustomer(body)

Create customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
CreateUpdateCustomer body = new CreateUpdateCustomer(); // CreateUpdateCustomer | 
try {
    Customer result = apiInstance.createCustomer(body);
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

### Return type

[**Customer**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteCustomer"></a>
# **deleteCustomer**
> Customer deleteCustomer(customerId)

Delete customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
String customerId = "customerId_example"; // String | 
try {
    Customer result = apiInstance.deleteCustomer(customerId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#deleteCustomer");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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
> Customer getCustomer(customerId)

Get customer

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
String customerId = "customerId_example"; // String | 
try {
    Customer result = apiInstance.getCustomer(customerId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#getCustomer");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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
> List&lt;Customer&gt; getCustomers()

List customers

Get a list of customers

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.CustomersApi;


CustomersApi apiInstance = new CustomersApi();
try {
    List<Customer> result = apiInstance.getCustomers();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CustomersApi#getCustomers");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Customer&gt;**](Customer.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

