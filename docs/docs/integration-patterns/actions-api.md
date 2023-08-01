import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Actions API (writes)

The Actions API lets you perform common operations on your customers' SaaS tools.

<ThemedImage
alt="actions api diagram"
width="75%"
sources={{
    light: '/img/actions-api-diagram-2.png',
    dark: '/img/actions-api-diagram-2.png',
  }}
/>

## How it works

1. You call Supaglue’s Actions API with a request payload.
2. Supaglue applies mappings ([Objects](../platform/objects/overview), [Entities](../platform/entities/overview), or [Common Schema](../platform/common-schema/overview)) and updates the data in your customer's third-party Provider tool.
3. Optional: For application databases (Postgres, MySQL, MongoDB), Supaglue updates your application DB for the corresponding record before returning a 200 response (see [data invalidation](#data-invalidation)).

The example below calls the Actions API to create a contact in Salesforce:

![actions_api_diagram](/img/actions-api-diagram.png 'actions API diagram')

## Data invalidation

Suppose you have configured an application destination (Postgres, MySQL, MongoDB) for managed syncs. In that case, Supaglue will immediately reflect any newly created or updated records in your destination after updating the third-party Provider.

For example, if you have updated an Account record in Salesforce, Supaglue will update the corresponding Account record in your Postgres database.

Data invalidation helps maintain data consistency between your customers' third-party Provider and Destination database.
