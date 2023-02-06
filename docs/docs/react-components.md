---
sidebar_position: 6
---

# React Components

:::caution

Supaglue is in Public Alpha. There are currently many missing features, interfaces will likely change, and it is not production-ready yet.

:::

Install **Supaglue's Next.js SDK** to use functional React components and hooks that are [fully customizable](#customizing-components). They are embeddable within your application so your customers can configure how Salesforce Syncs should work.

## Install @supaglue/nextjs

Navigate to your application's root directory and install the `@supaglue/nextjs` package:

```shell
yarn add @supaglue/nextjs
```

## Set Environment Keys

Set the following environment variables in your `.env` file.

```shell
NEXT_PUBLIC_SUPAGLUE_HOST=http://localhost:8080
```

:::caution

Supaglue's Nextjs SDK client-server authentication is not yet implemented.

:::

## Configure `<SupaglueProvider/>`

Supaglue requires your Next.js application to be wrapped in the `<SupaglueProvider/>` component. It provide active session, per-customer context, and sync context to Supaglue's hooks and components.

```jsx
// _app.tsx

import { SupaglueProvider } from '@supaglue/nextjs';

function App({ Component, pageProps }) {
  return (
    <SupaglueProvider {...pageProps} customerId={"your customer's id"}>
      <Component {...pageProps} />
    </SupaglueProvider>
  );
}

export default App;
```

## Components

#### `<SalesforceConnectButton/>`

A button that links to the Salesforce sign-in page or displays the sign-in page modal. By default, it is a `<button/>` tag that "Connect", but is completely customizable by passing children.

![salesforce_connect_button](/img/react_components/salesforce_connect_button.png 'salesforce connect button')

Example:

```jsx
<SalesforceConnectButton mode="redirect" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/SalesforceConnectButton/SalesforceConnectButton.tsx#L7)

#### `<FieldMapping>`

A card containing a list of your application fields that can be mapped to your customers' Salesforce fields.

![field_mapping](/img/react_components/field_mapping.png 'field mapping')

Example:

```jsx
<FieldMapping syncConfigName="contact_sync" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/FieldMapping/FieldMapping.tsx#L173)

...

#### `<TriggerSyncButton>`

A button that allows your customers to manually trigger a sync from Salesforce to your application.

![trigger_sync_button](/img/react_components/trigger_sync_button.png 'trigger_sync_button')

```jsx
<TriggerSyncButton
  syncConfigName="contact_sync"
  onSuccess={() => alert('Successfully started sync!')}
  onError={() => alert('Error encountered.')}
/>
```

Props: link

...

#### `<Switch>`

A switch used to turn on/off syncs from Salesforce to your application.

![switch](/img/react_components/switch.png 'switch')

Example:

```jsx
<Switch includeSyncDescription syncConfigName="contact_sync" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/Switch/Switch.tsx#L19)

#### `<IntegrationCard/>`

A card container housing the `<SalesforceConnectButton/>` along with a header, description, and icon.

![integration_card](/img/react_components/integration_card.png 'integration_card')

Example:

```jsx
...
```

Props: link

...

## Customizing Components

Supaglue offers complete customization of components to match your brand using the appearance prop. Customize base themes down to granular elements and content.

There are a few ways to customize Supaglue React Components using the `appearance` prop:

#### `elements`

Used for fine-grained theme overrides when you want to style specific HTML elements.

Use your browser inspector to view Supaglue namespaced CSS classes:

```html
<select class="sg-fieldDropdown ..."></select>
```

Use your preferred styling method to replace these classes with your own:

- Stylesheets / CSS Modules
- Tailwind CSS

Stylesheets / CSS Modules Example:

```css
/* FieldMapping.module.css */

.primaryColor {
  background-color: #e1e2e2;
}

.fieldName {
  font-style: italic;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
```

```jsx
<FieldMapping
  syncConfigName={syncConfigName}
  appearance={{
    elements: {
      form: styles.baseColor,
      fieldName: styles.fieldName,
    },
  }}
/>
```

Tailwind CSS Example:

```jsx
<FieldMapping
  syncConfigName={syncConfigName}
  appearance={{
    elements: {
      form: 'bg-base-300',
      fieldName: 'italic text-sm',
    },
  }}
/>
```
