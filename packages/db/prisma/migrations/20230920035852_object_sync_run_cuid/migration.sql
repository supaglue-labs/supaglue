-- AlterTable
ALTER TABLE "object_sync_runs" ADD COLUMN     "cuid" TEXT;

-- CreateIndex
CREATE INDEX "object_sync_runs_cuid_idx" ON "object_sync_runs"("cuid" DESC);
