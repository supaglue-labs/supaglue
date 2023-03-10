# IntegrationsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createIntegration**](IntegrationsApi.md#createIntegration) | **POST** /integrations | Create integration
[**deleteIntegration**](IntegrationsApi.md#deleteIntegration) | **DELETE** /integrations/{integration_id} | Delete integration
[**getIntegration**](IntegrationsApi.md#getIntegration) | **GET** /integrations/{integration_id} | Get integration
[**getIntegrations**](IntegrationsApi.md#getIntegrations) | **GET** /integrations | List integrations
[**updateIntegration**](IntegrationsApi.md#updateIntegration) | **PUT** /integrations/{integration_id} | Update integration

<a name="createIntegration"></a>
# **createIntegration**
> Integration createIntegration(body)

Create integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
CreateUpdateIntegration body = new CreateUpdateIntegration(); // CreateUpdateIntegration | 
try {
    Integration result = apiInstance.createIntegration(body);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#createIntegration");
    e.printStackTrace();
}
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

<a name="deleteIntegration"></a>
# **deleteIntegration**
> Integration deleteIntegration(integrationId)

Delete integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.deleteIntegration(integrationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#deleteIntegration");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integrationId** | **String**|  |

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getIntegration"></a>
# **getIntegration**
> Integration getIntegration(integrationId)

Get integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.getIntegration(integrationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#getIntegration");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integrationId** | **String**|  |

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getIntegrations"></a>
# **getIntegrations**
> List&lt;Integration&gt; getIntegrations()

List integrations

Get a list of integrations

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
try {
    List<Integration> result = apiInstance.getIntegrations();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#getIntegrations");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Integration&gt;**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateIntegration"></a>
# **updateIntegration**
> Integration updateIntegration(body, integrationId)

Update integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
CreateUpdateIntegration body = new CreateUpdateIntegration(); // CreateUpdateIntegration | 
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.updateIntegration(body, integrationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#updateIntegration");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateIntegration**](CreateUpdateIntegration.md)|  |
 **integrationId** | **String**|  |

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

