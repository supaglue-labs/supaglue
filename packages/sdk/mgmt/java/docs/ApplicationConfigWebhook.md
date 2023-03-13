# ApplicationConfigWebhook

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | **String** |  | 
**requestType** | [**RequestTypeEnum**](#RequestTypeEnum) |  | 
**notifyOnSyncSuccess** | **Boolean** |  | 
**notifyOnSyncError** | **Boolean** |  | 
**notifyOnConnectionSuccess** | **Boolean** |  | 
**notifyOnConnectionError** | **Boolean** |  | 
**headers** | **Map&lt;String, Object&gt;** |  |  [optional]

<a name="RequestTypeEnum"></a>
## Enum: RequestTypeEnum
Name | Value
---- | -----
GET | &quot;GET&quot;
POST | &quot;POST&quot;
PUT | &quot;PUT&quot;
DELETE | &quot;DELETE&quot;
PATCH | &quot;PATCH&quot;
