# PassthroughBody

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **String** | The path to send the request to (do not pass the domain) | 
**method** | [**MethodEnum**](#MethodEnum) |  | 
**headers** | **Map&lt;String, String&gt;** | Headers to pass to downstream |  [optional]
**query** | **Map&lt;String, String&gt;** | Query parameters to pass to downstream |  [optional]
**body** | **String** | Body to pass to downstream |  [optional]

<a name="MethodEnum"></a>
## Enum: MethodEnum
Name | Value
---- | -----
GET | &quot;GET&quot;
POST | &quot;POST&quot;
PUT | &quot;PUT&quot;
PATCH | &quot;PATCH&quot;
DELETE | &quot;DELETE&quot;
