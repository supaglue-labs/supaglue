-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "is_enabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "config" DROP NOT NULL;
