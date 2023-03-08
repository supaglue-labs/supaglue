/*
  Warnings:

  - Added the required column `application_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_id` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "application_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "application_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
