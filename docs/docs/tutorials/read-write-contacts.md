---
description: ''
---

import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Read and write contacts

![code](https://img.shields.io/badge/Code%20Tutorial-0000a5)

This tutorial will review how to read synced CRM contacts in your Postgres and create them in your customer's CRM.

## Prerequisites

This tutorial assumes you have gone through Supaglue's Quickstart and will use the following technologies:

- Typescript
- Nextjs 13
- Postgres
- Prisma

## Reading synced CRM contacts

Upon completing Supaglue's Quickstart, you will have your customers' CRM data in your Postgres database. Let's use a Nextjs 13 [Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components) and Prisma to render contacts in your app.

1. Go through the [Prisma steps](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql) to install and introspect Supaglue tables in your database.
2. In your Nextjs Server Component, use your generated Prisma client to read from the `crm_contacts` table and render it using React.

   ```tsx
   // app/people/page.tsx

   const crmContacts = await prisma.crm_contacts.findMany({
     where: {
       // Supaglue partitions your customer data in destination tables by
       // {application_id, customer_id, provider_name}.
       supaglue_application_id: APPLICATION_ID,
       supaglue_customer_id: CUSTOMER_ID,
       supaglue_provider_name: PROVIDER_NAME,
     },
   });

   // React component
   export default function People() {
     return (
       <div>
         {crmContacts.map((contact) => (
           <div>{contact.email}</div>
         ))}
       </div>
     );
   }
   ```

## Writing data to your customer's CRM

Now that you're fetching and rendering your customer's CRM contacts, we will use Supaglue's Action API to create contacts in your customer's CRM.

Let's add a button to a Nextjs Client Component that will use [SWR](https://swr.vercel.app/) to call a Nextjs [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) to create a contact in your customer's CRM.

1. Define a Nextjs API Route that `POST`s to Supaglue's [`/crm/v2/contacts`](https://docs.supaglue.com/api/v2/crm/create-contact) endpoint:

   ```typescript
   // app/api/create-crm-contact/route.ts

   export async function POST(request: Request) {
     const data = await request.json();

     const res = await fetch(`https://api.supaglue.io/crm/v2/contacts`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-api-key': process.env.NEXT_PUBLIC_SUPAGLUE_API_KEY,
         'x-customer-id': request.headers.get('x-customer-id'),
         'x-provider-name': request.headers.get('x-provider-name'),
       },
       body: JSON.stringify(data),
     });

     const responseData = await res.json();
     return NextResponse.json(responseData);
   }
   ```

2. Use [SWR](https://swr.vercel.app/) to call the Nextjs [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) we defined above in step 1:

   ```tsx
   // app/people/[...person]/page.tsx

   export default function Person() {
     const customerContext = useCustomerContext();
     const targetContact = getTargetContact();

     const { trigger, error, data } = useSWRMutation(`/api/create-crm-contact`, async (url, { arg }: { arg: any }) => {
       return await fetch(url, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'x-api-key': process.env.NEXT_PUBLIC_SUPAGLUE_API_KEY,
           'x-customer-id': customerContext.id,
           'x-provider-name': customerContext.providerName,
         },
         body: JSON.stringify(arg),
       });
     });

     return (
       <div>
         <div>{targetContact.firstName}</div>
         <button
           onClick={() => {
             trigger({
               record: {
                 first_name: targetContact.firstName,
                 last_name: targetContact.lastName,
                 email_addresses: [
                   {
                     email_address: targetContact.email,
                     email_address_type: 'primary',
                   },
                 ],
               },
             });
           }}
         >
           Add to CRM
         </button>
       </div>
     );
   }
   ```

:::info
Calling the Action API will update the data in your customer's CRM and then your Postgres.
:::
