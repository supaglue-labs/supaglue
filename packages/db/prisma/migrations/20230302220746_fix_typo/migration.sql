/*
  Warnings:

  - You are about to drop the column `_remote_aaccount_id` on the `crm_opportunities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crm_opportunities" DROP COLUMN "_remote_aaccount_id",
ADD COLUMN     "_remote_account_id" TEXT;
