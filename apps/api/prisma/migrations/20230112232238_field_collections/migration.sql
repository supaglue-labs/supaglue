/*
  Warnings:

  - Added the required column `fieldCollectionId` to the `workflows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "fieldCollectionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "field_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "field_list" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "field_collections_name_key" ON "field_collections"("name");

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_fieldCollectionId_fkey" FOREIGN KEY ("fieldCollectionId") REFERENCES "field_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
