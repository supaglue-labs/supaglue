-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "process_sync_changes_full" BOOLEAN,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
