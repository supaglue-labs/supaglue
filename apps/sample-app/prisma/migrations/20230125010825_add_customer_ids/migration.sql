/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,salesforce_id]` on the table `salesforce_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customer_id,salesforce_id]` on the table `salesforce_contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customer_id,salesforce_id]` on the table `salesforce_leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customer_id,salesforce_id]` on the table `salesforce_opportunities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customer_id` to the `salesforce_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `salesforce_contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `salesforce_leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `salesforce_opportunities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "salesforce_accounts_salesforce_id_key";

-- DropIndex
DROP INDEX "salesforce_contacts_salesforce_id_key";

-- DropIndex
DROP INDEX "salesforce_leads_salesforce_id_key";

-- DropIndex
DROP INDEX "salesforce_opportunities_salesforce_id_key";

-- AlterTable
ALTER TABLE "salesforce_accounts" ADD COLUMN     "customer_id" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "salesforce_contacts" ADD COLUMN     "customer_id" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "salesforce_leads" ADD COLUMN     "customer_id" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "salesforce_opportunities" ADD COLUMN     "customer_id" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_accounts_customer_id_salesforce_id_key" ON "salesforce_accounts"("customer_id", "salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_contacts_customer_id_salesforce_id_key" ON "salesforce_contacts"("customer_id", "salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_leads_customer_id_salesforce_id_key" ON "salesforce_leads"("customer_id", "salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_opportunities_customer_id_salesforce_id_key" ON "salesforce_opportunities"("customer_id", "salesforce_id");
