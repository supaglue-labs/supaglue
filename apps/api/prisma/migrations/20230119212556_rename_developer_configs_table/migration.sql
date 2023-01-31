/*
  Warnings:

  - You are about to drop the `DeveloperConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DeveloperConfig";

-- CreateTable
CREATE TABLE "developer_configs" (
    "id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_configs_pkey" PRIMARY KEY ("id")
);
