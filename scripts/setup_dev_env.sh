#!/bin/bash

cp docker-compose.override.dev.yml docker-compose.override.yml
brew install bufbuild/buf/buf
cp apps/mgmt-ui/.env.sample apps/mgmt-ui/.env
