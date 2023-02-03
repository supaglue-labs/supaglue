---
sidebar_position: 6
---

# React Components (Next.js SDK)

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

[screenshot here]

Example:

```jsx
<SalesforceConnectButton mode="redirect" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/SalesforceConnectButton/SalesforceConnectButton.tsx#L7)

#### `<FieldMapping>`

A card containing a list of your application fields that can be mapped to your customers' Salesforce fields.

[screenshot here]

Example:

```jsx
<FieldMapping syncConfigName="contact_sync" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/FieldMapping/FieldMapping.tsx#L173)

...

#### `<TriggerSyncButton>`

A button that allows your customers to manually trigger a sync from Salesforce to your application.

[screenshot here]

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

[screenshot here]

Example:

```jsx
<Switch syncConfigName="contact_sync" />
```

Props: [link](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/packages/nextjs/src/components/Switch/Switch.tsx#L19)

#### `<SalesforceConnectCard/>` (preview only)

A card container housing the `<SalesforceConnectButton/>` along with a header, description, and icon.

[screenshot here]

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

:::info

For Stylesheets/CSS Modules users: Set classes as `!important`. This will change in the future.

:::

```css
/* FieldMapping.module.css */

.primaryColor {
  background-color: #e1e2e2 !important;
}

.fieldName {
  font-style: italic !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}
```

```jsx
<FieldMapping
  syncConfigName={syncConfigName}
  key={syncConfigName}
  appearance={{
    elements: {
      form: styles.baseColor,
      fieldName: styles.fieldName,
    },
  }}
/>
```

Tailwind CSS Example:

:::info

For Tailwind CSS users: To customize components today you will need to set `important: true;` in your `tailwind.config.js` as per https://tailwindcss.com/docs/configuration#important. This will change in the future.

:::

```jsx
<FieldMapping
  syncConfigName={syncConfigName}
  key={syncConfigName}
  appearance={{
    elements: {
      form: 'bg-base-300',
      fieldName: 'italic text-sm',
    },
  }}
/>
```

## Hooks (preview only)

#### `useSalesforceSignIn`

Access the SignIn object inside your components

```jsx
import { useWorkflow } from '@supaglue/react';

function Example() {
  const { redirectUrl } = useSalesforceSignIn();

  return <>{/* implement your own sign-in button */}</>;
}

export default Example;
```

#### `useSync`

Access the Sync object inside your components

Example:

```jsx
import { useSync } from '@supaglue/react';

function Example() {
  const { fieldMappings, name, isLoaded } = useSync();

  if (!isLoaded) {
    // implement your own loading state
    return null;
  }

  return <>{/* implement your own field mapping ui */}</>;
}

export default Example;
```
