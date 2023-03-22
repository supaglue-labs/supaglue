/*
  Warnings:

  - Added the required column `org_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_id` to the `sg_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "org_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sg_users" ADD COLUMN     "org_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "sg_users" ADD CONSTRAINT "sg_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
