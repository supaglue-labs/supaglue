# ApplicationsApi

All URIs are relative to *http://localhost:8080/mgmt/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createApplication**](ApplicationsApi.md#createApplication) | **POST** /applications | Create application
[**deleteApplication**](ApplicationsApi.md#deleteApplication) | **DELETE** /applications/{application_id} | Delete application
[**getApplication**](ApplicationsApi.md#getApplication) | **GET** /applications/{application_id} | Get application
[**getApplications**](ApplicationsApi.md#getApplications) | **GET** /applications | List applications
[**updateApplication**](ApplicationsApi.md#updateApplication) | **PUT** /applications/{application_id} | Update application

<a name="createApplication"></a>
# **createApplication**
> Application createApplication(body)

Create application

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ApplicationsApi;


ApplicationsApi apiInstance = new ApplicationsApi();
CreateUpdateApplication body = new CreateUpdateApplication(); // CreateUpdateApplication | 
try {
    Application result = apiInstance.createApplication(body);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ApplicationsApi#createApplication");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateApplication**](CreateUpdateApplication.md)|  |

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="deleteApplication"></a>
# **deleteApplication**
> Application deleteApplication(applicationId)

Delete application

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ApplicationsApi;


ApplicationsApi apiInstance = new ApplicationsApi();
String applicationId = "applicationId_example"; // String | 
try {
    Application result = apiInstance.deleteApplication(applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ApplicationsApi#deleteApplication");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getApplication"></a>
# **getApplication**
> Application getApplication(applicationId)

Get application

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ApplicationsApi;


ApplicationsApi apiInstance = new ApplicationsApi();
String applicationId = "applicationId_example"; // String | 
try {
    Application result = apiInstance.getApplication(applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ApplicationsApi#getApplication");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationId** | **String**|  |

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getApplications"></a>
# **getApplications**
> List&lt;Application&gt; getApplications()

List applications

Get a list of applications

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ApplicationsApi;


ApplicationsApi apiInstance = new ApplicationsApi();
try {
    List<Application> result = apiInstance.getApplications();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ApplicationsApi#getApplications");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**List&lt;Application&gt;**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="updateApplication"></a>
# **updateApplication**
> Application updateApplication(body, applicationId)

Update application

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ApplicationsApi;


ApplicationsApi apiInstance = new ApplicationsApi();
CreateUpdateApplication body = new CreateUpdateApplication(); // CreateUpdateApplication | 
String applicationId = "applicationId_example"; // String | 
try {
    Application result = apiInstance.updateApplication(body, applicationId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ApplicationsApi#updateApplication");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**CreateUpdateApplication**](CreateUpdateApplication.md)|  |
 **applicationId** | **String**|  |

### Return type

[**Application**](Application.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

