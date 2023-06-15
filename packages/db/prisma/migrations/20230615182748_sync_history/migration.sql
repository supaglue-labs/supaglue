-- AlterTable
ALTER TABLE "sync_history" ADD COLUMN     "raw_object" TEXT,
ALTER COLUMN "model" DROP NOT NULL;
