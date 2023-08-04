import ThemedImage from '@theme/ThemedImage';

# Build an object and field mapping UI

![code](https://img.shields.io/badge/Code%20Tutorial-0000a5)

This tutorial will show how to build an object mapping and field mapping UI for your customers to map to your application's data models.

<ThemedImage
alt="field mapping ui"
width="75%"
sources={{
    light: '/img/entity-mapping-ui-tutorial.png',
    dark: '/img/entity-mapping-ui-tutorial.png',
  }}
/>

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart), [Unifying objects with entities](./unify-objects-with-entities), and will use the following technologies:

- Typescript
- Nextjs 13
- Tailwind css

## Rendering Entity Mappings

To render the reference Entity Mapping UI from above, we will need five pieces of information:

1. The customer id and Provider name (you already have these)
1. The Entity name and any customer-mapped object
1. The Entity fields and any customer-mapped fields
1. List of mappable Provider objects
1. List of mappable Provider-object fields

### Rendering 2 + 3: Entity name/fields and customer-mapped object/fields

To render (2) the entity name and any customer-mapped object and (3) the entity fields and any customer-mapped fields, we'll need to fetch the [Entity Mappings](../platform/entities/overview#entity-mapping) from the [List Entity Mappings API](../api/v2/mgmt/list-entity-mappings).

<ThemedImage
alt="field mapping ui"
width="75%"
sources={{
    light: '/img/entity-mapping-ui-tutorial-2-3.png',
    dark: '/img/entity-mapping-ui-tutorial-2-3.png',
  }}
/>

Let's use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) in a Nextjs [Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components) to call the API:

```jsx
export async function fetchEntityMappings(customerId, providerName) {
  const response = await fetch(`https://api.supaglue.io/mgmt/v2/entity_mappings`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_SUPAGLUE_API_KEY,
      'x-customer-id': customerId, // jane-doe
      'x-provider-name': providerName, // hubspot
    },
    cache: 'no-store',
  });

  const entityMappings = await response.json();
  return entityMappings;
}
```

It will return a response that looks like the following:

```json
{
  "entity_id": "...",
  "entity_name": "contact",
  "allow_additional_field_mappings": false,
  "object": {
    "type": "standard",
    "name": "Contact",
    "from": "customer"
  },
  "field_mappings": [
    {
      "entity_field": "first_name",
      "mapped_field": null,
      "from": null,
      "is_additional": false
    },
    {
      "entity_field": "first_name",
      "mapped_field": null,
      "from": null,
      "is_additional": false
    },
    {
      "entity_field": "address",
      "mapped_field": null,
      "from": null,
      "is_additional": false
    }
  ]
}
```

Use `entity_name` and `object.name` to render (2) the entity name and any customer-mapped object.

Use `field_mappings[].entity_field` and `field_mappings[].mapped_field` to render (3) the entity fields and any customer-mapped fields.

### Rendering 4 + 5: Lists of mappable Provider objects and fields

To render (4) the list of mappable Provider objects, you must create the list yourself.

:::info
A Metadata API to fetch a list of Provider objects is under construction.
:::

To render (5) the list of mappable Provider-object fields, we'll need to call Supaglue's [Properties API](../api/v2/metadata/list-properties).

<ThemedImage
alt="field mapping ui"
width="75%"
sources={{
    light: '/img/entity-mapping-ui-tutorial-4.png',
    dark: '/img/entity-mapping-ui-tutorial-4.png',
  }}
/>

<ThemedImage
alt="field mapping ui"
width="75%"
sources={{
    light: '/img/entity-mapping-ui-tutorial-5.png',
    dark: '/img/entity-mapping-ui-tutorial-5.png',
  }}
/>

Let's use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) in a Nextjs [Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components) to call the API:

```jsx
export async function fetchProperties(
  customerId: string,
  objectType: string,
  objectName: string,
  providerName: string
) {
  const response = await fetch(`https://api.supaglue.io/mgmt/v2/properties?type=${objectType}&name=${objectName}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_SUPAGLUE_API_KEY,
      'x-customer-id': customerId,
      'x-provider-name': providerName,
    },
  });

  const properties = await response.json();
  return properties;
}
```

It will return a response that looks like the following:

```json
{
  "properties": [
    {
      "id": "firstname",
      "label": "First Name"
    },
    {
      "id": "lastname",
      "label": "Last Name"
    },
    {
      "id": "address",
      "label": "Street Address"
    },
    ...
  ]
}
```

## Saving Entity Mappings

Use the [Upsert Entity Mappings API](../api/v2/mgmt/upsert-entity-mapping) to save your customer's Entity Mappings by Provider, e.g. Hubspot in this tutorial. Below is a Route Handler example:

```js
export async function PUT(request) {
  const data = await request.json();

  const res = await fetch(
    `https://api.supaglue.io/mgmt/v2/entity_mappings/${data.entity_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_SUPAGLUE_API_KEY!,
        "x-customer-id": request.headers.get("x-customer-id")!,
        "x-provider-name": request.headers.get("x-provider-name")!,
      },
      body: JSON.stringify(data),
    }
  );

  const responseData = await res.text();
  return NextResponse.json(responseData);
}
```

:::info
This endpoint is idempotent.
:::

In your Nextjs [Client Component](https://nextjs.org/docs/getting-started/react-essentials#client-components), make a deep copy of the [List Entity Mappings API](../api/v2/mgmt/list-entity-mappings) response from earlier, and update its `field_mappings` values based on your customer's selections in the UI.

```jsx
// EntityMapping.jsx

...
const [fieldMappings, setFieldMappings] = useState([...entityMapping.field_mappings]);
...
```

Call `setFieldMappings` with a new deep copy of the field mappings whenever the customer makes a selection:

```jsx
// EntityMapping.jsx

<FieldMapping
  ...
  onChange((event) => {
    const newFieldMappings = [...fieldMappings];
    newFieldMappings[idx].mapped_field = event.target.value;
    setFieldMappings(newFieldMappings);
  ...
/>
})

```

Use [`useSWRMutation`](https://swr.vercel.app/docs/mutation) to call the [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) we defined above:

```jsx
// EntityMapping.jsx

<button
  onClick=(() => {
    trigger({
      entity_id: entityMapping.entity_id,
      object: {
        type: "standard",
        name: "contact", // Hubspot contact
      },
      field_mappings: fieldMappings,
    });
  })
>
  Save
</button>
```
