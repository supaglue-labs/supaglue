-- CreateTable
CREATE TABLE "integration_changes" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_changes_pkey" PRIMARY KEY ("id")
);
