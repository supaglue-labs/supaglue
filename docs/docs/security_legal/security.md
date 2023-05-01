---
description: ''
---

# Security

## Data we collect and store
Supaglue is open source, but Supaglue Cloud provides a hosted version of the software. This means that the following types of data are collected and stored by Supaglue in order to provide our services:

- Account metadata (company name, payment plan, etc.)
- User account data (email, avatar, group membership, etc.)
- Connection metadata (task names, description, parameters, etc.)
- Resource metadata (database connection information)
- Usage analytics data (URLs of pages visited, etc.)
- Logs and output produced by syncs, API calls, and other operations that are run through Supaglue

## Infrastructure and network security
Security is a top priority for us and we take the following measures to keep your data and account secure.

### Hosting
Supaglue is hosted on Amazon Web Services (AWS) and all of our AWS servers are located in the United States. AWS data centers have state-of-the-art physical access controls, logical access controls, and frequent third-party independent audits. Amazon has published a detailed security whitepaper outlining these measures.

Supaglue employees have audited and as-needed access to infrastructure on AWS. All employees have dedicated user accounts and access infrastructure via two-factor authentication.

### SOC 2 Compliance
Supaglue is SOC 2 compliant. This means that we regularly undergo third-party external penetration tests, conduct background checks of new employees, have all employees go through security awareness training, and more. To access our SOC 2 report, please email us at hello@supaglue.com.

### Encryption
All data in transit is encrypted over HTTPS/TLS between you and Supaglue's servers.
All data at rest is stored encrypted and replicated for durability.

# Application security

## Two-factor authentication and single sign-on
Supaglue currently supports G Suite signon, allowing customers to enforce that users sign in using customer-managed identity providers.

G Suite SSO is restricted to domain(s), so that customers can ensure users only sign in using customer-managed G Suite accounts.

Two-factor authentication for application login can be enforced at the identity provider level (e.g. by turning it on within G Suite).

## How to report vulnerabilities
You can email hello@supaglue.com with details on any security vulnerabilities you discover.
