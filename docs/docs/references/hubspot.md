# Hubspot Connected App

1. Login to your Hubspot developer account: https://app.hubspot.com/developer
2. Navigate to your Connected Application
3. Click on the "Auth" tab
4. Take note of "Client ID", "Client secret" to enter into Supaglue's Management Portal
5. Enter your OAuth2 redirect URL under "Redirect URLs"
6. Check the following scopes under "Scopes":

Required for reads:

- `crm.objects.owners.read`
- `crm.objects.companies.read`
- `crm.lists.read`
- `crm.objects.deals.read`
- `crm.objects.contacts.read`

Required for writes:

- `crm.objects.contacts.write`
- `crm.objects.companies.write`
- `crm.objects.deals.write`
- `crm.lists.write`
