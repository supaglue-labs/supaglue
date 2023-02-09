/*
  Warnings:

  - You are about to drop the column `salesforce_api_usage_limit_percentage` on the `syncs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "syncs" DROP COLUMN "salesforce_api_usage_limit_percentage",
ADD COLUMN     "destination" JSONB,
ADD COLUMN     "source" JSONB;
