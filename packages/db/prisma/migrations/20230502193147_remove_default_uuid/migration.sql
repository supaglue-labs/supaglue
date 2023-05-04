/*
  Warnings:

  - The primary key for the `crm_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `crm_contacts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `crm_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `crm_leads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `crm_opportunities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `crm_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `crm_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `crm_contacts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `crm_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `crm_leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `crm_opportunities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `crm_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "crm_accounts" DROP CONSTRAINT "crm_accounts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "crm_contacts" DROP CONSTRAINT "crm_contacts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "crm_leads" DROP CONSTRAINT "crm_leads_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "crm_opportunities" DROP CONSTRAINT "crm_opportunities_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "crm_users" DROP CONSTRAINT "crm_users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "crm_users_pkey" PRIMARY KEY ("id");
