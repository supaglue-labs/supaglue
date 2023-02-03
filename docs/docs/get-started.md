---
sidebar_position: 2
---

# Get Started

## Run Supaglue locally with Docker Compose

```shell
# Clone our repo
git clone git@github.com:supaglue-labs/supaglue.git
cd supaglue

# generate a encryption secret for credentials
echo "SUPAGLUE_API_ENCRYPTION_SECRET=$(openssl rand -base64 32)" >> .env

# Run the Supaglue stack
docker compose up
```

Next, go through a tutorial to deploy an integration to a sample app and then customize it.
