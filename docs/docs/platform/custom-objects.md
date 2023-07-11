---
description: ''
---

# Custom objects

Supaglue provides an API to:

- create custom objects,
- create custom object records,
- create association types between objects, and
- create associations between records.

## Example

Suppose that you want to store information about competitors that are relevant to a particular Salesforce Opportunity. You could use Supaglue's Custom Objects API to do the following:

1. Create a custom object called `Competitor Info`.
1. Create a association type between `Opportunity` and `Competitor Info`.
1. Whenever a new `Opportunity` record is created, find an existing `Competitor Info` record, or create a new one, and associate it with the `Opportunity` record.
