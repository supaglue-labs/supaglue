---
sidebar_position: 4
---

# Customize integration

Now that we've gone through the entire integration lifecycle, let's customize the Sync Config and the React components.

## Customize Sync Config

You may have realized that two of the columns in the sample app's Contacts table are missing. Let's add two fields, last name and title, to be synced. These will be available for customers to map.

1. Update the schema object to include the two missing fields:

   ```tsx title=supaglue-config/contact.ts
   const contactSchema = sdk.schema({
     fields: [
       // ...
       {
         name: 'last_name',
         label: 'last name',
       },
       {
         name: 'title',
         label: 'title',
       },
     ],
   });
   ```

1. Re-run the [`apply`](/cli#apply) CLI command to apply the latest changes:

   ```shell
   supaglue apply supaglue-config
   ```

1. Refresh your sample app. On the "Salesforce Integration" page you should now see two newly configured fields:

   [screenshot]

1. Click "Run sync now". Once the background sync completes, verify the newly synced fields now contain values on the "App Objects" page.

   [screenshot]

## Customize React components

Supaglue provides several React component customization options to change its look-and-feel.

1. In the sample app, locate the `<FieldMapping/>` component and add the following `appearance` prop to change the background of the form:

   ```jsx title=apps/sample-app/src/pages/integrations/[type].tsx:109
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

2. The sample app should hot reload. Note the updated styling in the sample app.

## Next Steps

You've successfully shipped your first Salesforce integration using Supaglue, complete with customizations. Congrats!

Learn more about how Supaglue works in the Concepts section.
