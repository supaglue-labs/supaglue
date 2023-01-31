-- CreateTable
CREATE TABLE "DeveloperConfig" (
    "id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperConfig_pkey" PRIMARY KEY ("id")
);
