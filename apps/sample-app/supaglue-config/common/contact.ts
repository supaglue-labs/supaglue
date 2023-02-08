import * as sdk from '@supaglue/sdk';

export const contactMapping = sdk.defaultFieldMapping([
  { name: 'salesforce_id', field: 'Id' },
  { name: 'email', field: 'Email' },
  { name: 'first_name', field: 'FirstName' },
  { name: 'last_name', field: 'LastName' },
  { name: 'title', field: 'Title' },
]);
