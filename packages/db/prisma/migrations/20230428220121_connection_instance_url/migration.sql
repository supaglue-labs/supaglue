--  This migration SQL has been modified after the creation to backfill the correct `instance_url` field from the existing `remote_id` field
-- AlterTable
ALTER TABLE
  "connections"
ADD
  column "instance_url" text NOT NULL DEFAULT '';
-- Update instance_url to be remote_id for salesforce
UPDATE
  "connections" SET instance_url = remote_id
WHERE
  instance_url = ''
  AND provider_name = 'salesforce';
-- Update instance_url for hubspot
UPDATE
  "connections" SET instance_url = CONCAT(
    'https://app.hubspot.com/contacts/',
    remote_id
  )
WHERE
  instance_url = ''
  AND provider_name = 'hubspot';
