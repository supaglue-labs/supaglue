-- AlterTable
ALTER TABLE "crm_accounts" ADD COLUMN     "detected_or_remote_deleted_at" TIMESTAMP(3),
ADD COLUMN     "remote_deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_contacts" ADD COLUMN     "detected_or_remote_deleted_at" TIMESTAMP(3),
ADD COLUMN     "remote_deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_leads" ADD COLUMN     "detected_or_remote_deleted_at" TIMESTAMP(3),
ADD COLUMN     "remote_deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_opportunities" ADD COLUMN     "detected_or_remote_deleted_at" TIMESTAMP(3),
ADD COLUMN     "remote_deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crm_users" ADD COLUMN     "detected_or_remote_deleted_at" TIMESTAMP(3),
ADD COLUMN     "remote_deleted_at" TIMESTAMP(3);
