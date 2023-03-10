# ConnectionsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteConnection**](ConnectionsApi.md#deleteConnection) | **DELETE** /customers/{customer_id}/connections/{connection_id} | Delete connection
[**getConnection**](ConnectionsApi.md#getConnection) | **GET** /customers/{customer_id}/connections/{connection_id} | Get connection
[**getConnections**](ConnectionsApi.md#getConnections) | **GET** /customers/{customer_id}/connections | List connections

<a name="deleteConnection"></a>
# **deleteConnection**
> Connection deleteConnection(customerId, connectionId)

Delete connection

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ConnectionsApi;


ConnectionsApi apiInstance = new ConnectionsApi();
String customerId = "customerId_example"; // String | 
String connectionId = "connectionId_example"; // String | 
try {
    Connection result = apiInstance.deleteConnection(customerId, connectionId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ConnectionsApi#deleteConnection");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**|  |
 **connectionId** | **String**|  |

### Return type

[**Connection**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getConnection"></a>
# **getConnection**
> Connection getConnection(customerId, connectionId)

Get connection

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ConnectionsApi;


ConnectionsApi apiInstance = new ConnectionsApi();
String customerId = "customerId_example"; // String | 
String connectionId = "connectionId_example"; // String | 
try {
    Connection result = apiInstance.getConnection(customerId, connectionId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ConnectionsApi#getConnection");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**|  |
 **connectionId** | **String**|  |

### Return type

[**Connection**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getConnections"></a>
# **getConnections**
> List&lt;Connection&gt; getConnections(customerId)

List connections

Get a list of connections

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ConnectionsApi;


ConnectionsApi apiInstance = new ConnectionsApi();
String customerId = "customerId_example"; // String | 
try {
    List<Connection> result = apiInstance.getConnections(customerId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ConnectionsApi#getConnections");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerId** | **String**|  |

### Return type

[**List&lt;Connection&gt;**](Connection.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

