/*
  Warnings:

  - Added the required column `sync_timestamp` to the `salesforce_opportunities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "salesforce_opportunities" ADD COLUMN     "sync_timestamp" TIMESTAMP(3) NOT NULL;
