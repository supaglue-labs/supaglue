/*
  Warnings:

  - Changed the type of `tags` on the `engagement_sequences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "engagement_sequences" DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB NOT NULL;
