/*
  Warnings:

  - You are about to drop the `salesforce_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "salesforce_users";

-- CreateTable
CREATE TABLE "salesforce_contacts" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "salesforce_id" VARCHAR(255),
    "title" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salesforce_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesforce_opportunities" (
    "id" SERIAL NOT NULL,
    "salesforce_id" VARCHAR(255),
    "name" VARCHAR(255),
    "salesforce_account_id" TEXT,
    "close_date" TIMESTAMP(3) NOT NULL,
    "stage" VARCHAR(255) NOT NULL,
    "amount" MONEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salesforce_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesforce_accounts" (
    "id" SERIAL NOT NULL,
    "salesforce_id" VARCHAR(255),
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salesforce_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesforce_leads" (
    "id" SERIAL NOT NULL,
    "salesforce_id" VARCHAR(255),
    "title" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salesforce_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_contacts_salesforce_id_key" ON "salesforce_contacts"("salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_opportunities_salesforce_id_key" ON "salesforce_opportunities"("salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_accounts_salesforce_id_key" ON "salesforce_accounts"("salesforce_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_leads_salesforce_id_key" ON "salesforce_leads"("salesforce_id");
