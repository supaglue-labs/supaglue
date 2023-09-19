-- AlterTable
ALTER TABLE "object_sync_runs" ADD COLUMN     "connection_id" TEXT,
ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "object" TEXT,
ADD COLUMN     "object_type" TEXT,
ADD COLUMN     "sync_type" TEXT DEFAULT 'object';
