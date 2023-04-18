---
description: ''
---

# Pagination

Learn how to paginate the results of list endpoints.

## Overview

If there are too many records to be returned for an object in one request, you can divide them up into pages. This is done using the `cursor` and `page_size` query parameters:

- `page_size`: specifies how many results to return per list request.
- `cursor`: determines which page of the total result set should be returned.

The `next` and `previous` cursor values in a list endpoint response are the cursor values to fetch the respective pages. If a value is null, then you have hit the end of page.

:::info

Supaglue list endpoints are sorted by id (UUID) as its  stable sort key.

:::

Example request:

```curl
curl 'http://localhost:8080/crm/v1/contacts?page_size=10'
```

Example response:

```console
{
    "next": "eyJpZCI6IjAwMWM2ZWU1LTQzNDktNGUyYi1hMjA2LTM4ZjA1MGRjNGM2MiIsInJldmVyc2UiOmZhbHNlfQ==",
    "previous": null,
    "results": [...]
}
```

To consume the next 10 results, set cursor to the `next` value:

```curl
curl 'http://localhost:8080/crm/v1/contacts?page_size=10&cursor=eyJpZCI6IjAwMWM2ZWU1LTQzNDktNGUyYi1hMjA2LTM4ZjA1MGRjNGM2MiIsInJldmVyc2UiOmZhbHNlfQ=='
```

When you've reached the last page, the `next` cursor will be null:

```console
{
    "next": null,
    "previous": "eyJpZCI6IjAwMzAyYTMyLWNkYTAtNGI1My1iZGU4LTRhZjliZmMxZmQxZiIsInJldmVyc2UiOmZhbHNlfQ==",
    "results": [...]
}
```
