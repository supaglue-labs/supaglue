-- AlterTable
ALTER TABLE "crm_accounts" ADD COLUMN     "last_modified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_contacts" ADD COLUMN     "last_modified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_leads" ADD COLUMN     "last_modified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_opportunities" ADD COLUMN     "last_modified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_users" ADD COLUMN     "last_modified_at" TIMESTAMP(3);
