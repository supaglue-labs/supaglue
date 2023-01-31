---
sidebar_position: 4
---

# Customize integration

Now that we've gone through the entire integration lifecycle, let's add some customizations.

## Customize Developer Config

You may have realized that 2 of the columns in our Contacts table are missing. Let's add two fields, last name and title, to be synced. These will be available for customers to map.

1. Update the schema object to include the two missing fields:

   ```tsx title=apps/sample-app/supaglue-config/contact.ts
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

1. Re-run the CLI command to apply the latest changes:

   ```shell
   supaglue apply supaglue-config
   ```

1. Refresh your sample app. You should now see two newly configured fields:

   [screenshot]

1. Click "Run sync now". Once the background sync completes, verify the newly synced fields under the "App Objects" tab.

## Customize React components

Supaglue provides several React component customization options to make the UI look native to your application.

1. In the sample app, add the `appearance` prop to the `<FieldMapping/>` component:

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

2. View the updated styling in the sample app.

## Next Steps

You've successfully shipped your first Salesforce integration using Supaglue, complete with customizations. Congrats!

Learn more about how Supaglue works in the Concepts section.