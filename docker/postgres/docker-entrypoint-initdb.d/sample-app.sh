#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE ROLE sample_app WITH PASSWORD 'sample_app' SUPERUSER LOGIN;
	CREATE DATABASE sample_app;
	GRANT ALL PRIVILEGES ON DATABASE sample_app TO sample_app;
EOSQL
