# IntegrationsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createIntegration**](IntegrationsApi.md#createIntegration) | **POST** /applications/{application_id}/integrations | Create integration
[**deleteIntegration**](IntegrationsApi.md#deleteIntegration) | **DELETE** /applications/{application_id}/integrations/{integration_id} | Delete integration
[**getIntegration**](IntegrationsApi.md#getIntegration) | **GET** /applications/{application_id}/integrations/{integration_id} | Get integration
[**getIntegrations**](IntegrationsApi.md#getIntegrations) | **GET** /applications/{application_id}/integrations | List integrations
[**updateIntegration**](IntegrationsApi.md#updateIntegration) | **PUT** /applications/{application_id}/integrations/{integration_id} | Update integration

<a name="createIntegration"></a>
# **createIntegration**
> Integration createIntegration(body, applicationId)

Create integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
CreateUpdateIntegration body = new CreateUpdateIntegration(); // CreateUpdateIntegration | 
String applicationId = "applicationId_example"; // String | 
try {
    Integration result = apiInstance.createIntegration(body, applicationId);
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
 **applicationId** | **String**|  |

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteIntegration"></a>
# **deleteIntegration**
> Integration deleteIntegration(applicationId, integrationId)

Delete integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
String applicationId = "applicationId_example"; // String | 
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.deleteIntegration(applicationId, integrationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#deleteIntegration");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |
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
> Integration getIntegration(applicationId, integrationId)

Get integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
String applicationId = "applicationId_example"; // String | 
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.getIntegration(applicationId, integrationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#getIntegration");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |
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
> List&lt;Integration&gt; getIntegrations(applicationId)

List integrations

Get a list of integrations

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
String applicationId = "applicationId_example"; // String | 
try {
    List<Integration> result = apiInstance.getIntegrations(applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling IntegrationsApi#getIntegrations");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |

### Return type

[**List&lt;Integration&gt;**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateIntegration"></a>
# **updateIntegration**
> Integration updateIntegration(body, applicationId, integrationId)

Update integration

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.IntegrationsApi;


IntegrationsApi apiInstance = new IntegrationsApi();
CreateUpdateIntegration body = new CreateUpdateIntegration(); // CreateUpdateIntegration | 
String applicationId = "applicationId_example"; // String | 
String integrationId = "integrationId_example"; // String | 
try {
    Integration result = apiInstance.updateIntegration(body, applicationId, integrationId);
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
 **applicationId** | **String**|  |
 **integrationId** | **String**|  |

### Return type

[**Integration**](Integration.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

