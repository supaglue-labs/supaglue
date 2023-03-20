/*
  Warnings:

  - You are about to drop the column `application_id` on the `sg_users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `sg_users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "sg_users" DROP CONSTRAINT "sg_users_application_id_fkey";

-- DropIndex
DROP INDEX "sg_users_application_id_username_key";

-- AlterTable
ALTER TABLE "sg_users" DROP COLUMN "application_id";

-- CreateIndex
CREATE UNIQUE INDEX "sg_users_username_key" ON "sg_users"("username");
