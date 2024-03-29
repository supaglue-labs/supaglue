/*
  Warnings:

  - You are about to drop the column `owner` on the `crm_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `crm_leads` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `crm_opportunities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crm_accounts" DROP COLUMN "owner",
ADD COLUMN     "_remote_owner_id" TEXT,
ADD COLUMN     "owner_id" TEXT;

-- AlterTable
ALTER TABLE "crm_contacts" ADD COLUMN     "_remote_owner_id" TEXT,
ADD COLUMN     "owner_id" TEXT;

-- AlterTable
ALTER TABLE "crm_leads" DROP COLUMN "owner",
ADD COLUMN     "_remote_owner_id" TEXT,
ADD COLUMN     "owner_id" TEXT;

-- AlterTable
ALTER TABLE "crm_opportunities" DROP COLUMN "owner",
ADD COLUMN     "_remote_owner_id" TEXT,
ADD COLUMN     "owner_id" TEXT;

-- AddForeignKey
ALTER TABLE "crm_accounts" ADD CONSTRAINT "crm_accounts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
