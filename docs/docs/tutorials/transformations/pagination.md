# Pagination

:::info
This is under construction.
:::

### Read the last high watermark

Supaglue provides a `_supaglue_last_modified_at` timestamp field that represents the last time a record was modified in the upstream provider. Therefore, as long as we keep track of the maximum such value each time our transformation function is invoked, we can use the previous maximum value (hereafter referred to as "high watermark") to paginate over newly-synced records incrementally.

```ts
// Find high watermark for this sync
const lastMaxLastModifiedAtMs = await step.run('Get high watermark', async () => {
  const state = await prismaApp.syncState.findUnique({
    where: {
      providerName_customerId_object: {
        providerName: data.provider_name,
        customerId: data.customer_id,
        object: data.object,
      },
    },
  });

  return state?.maxLastModifiedAt?.getTime();
});
```

### Update the high watermark

Finally, we want to update the high watermark for a given provider/customer/object:

```ts
// record the high watermark seen
if (newMaxLastModifiedAtMs) {
  await step.run('Record high watermark', async () => {
    const state = {
      providerName: data.provider_name,
      customerId: data.customer_id,
      object: data.object,
      maxLastModifiedAt: newMaxLastModifiedAtMs ? new Date(newMaxLastModifiedAtMs) : undefined,
    };
    await prismaApp.syncState.upsert({
      create: state,
      update: state,
      where: {
        providerName_customerId_object: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          object: data.object,
        },
      },
    });
  });
}

return {
  event,
  body: 'Successfully copied updated records from staging into prod table',
};
```
