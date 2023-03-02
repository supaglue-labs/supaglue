-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "auth_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "remote_provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "remote_provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_accounts" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "owner" VARCHAR(255),
    "name" VARCHAR(255),
    "description" TEXT,
    "industry" VARCHAR(255),
    "website" VARCHAR(255),
    "number_of_employees" INTEGER,
    "addresses" JSONB,
    "phone_numbers" JSONB,
    "last_activity_at" TIMESTAMP(3),
    "remote_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "addresses" JSONB NOT NULL,
    "email_addresses" JSONB NOT NULL,
    "phone_numbers" JSONB NOT NULL,
    "last_activity_at" TIMESTAMP(3),
    "remote_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_remote_account_id" TEXT,
    "account_id" TEXT,

    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_leads" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "owner" VARCHAR(255),
    "lead_source" VARCHAR(255),
    "title" VARCHAR(255),
    "company" VARCHAR(255),
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "addresses" JSONB,
    "phone_numbers" JSONB,
    "email_addresses" JSONB,
    "remote_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "converted_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_converted_remote_account_id" TEXT,
    "converted_account_id" TEXT,
    "_converted_remote_contact_id" TEXT,
    "converted_contact_id" TEXT,

    CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_opportunities" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "owner" VARCHAR(255),
    "name" VARCHAR(255),
    "description" TEXT,
    "amount" INTEGER,
    "stage" VARCHAR(255),
    "status" VARCHAR(255),
    "last_activity_at" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_remote_aaccount_id" TEXT,
    "account_id" TEXT,

    CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_remote_provider_key" ON "integrations"("remote_provider");

-- CreateIndex
CREATE UNIQUE INDEX "connections_customer_id_integration_id_key" ON "connections"("customer_id", "integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_accounts_connection_id_remote_id_key" ON "crm_accounts"("connection_id", "remote_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_contacts_connection_id_remote_id_key" ON "crm_contacts"("connection_id", "remote_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_leads_connection_id_remote_id_key" ON "crm_leads"("connection_id", "remote_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_opportunities_connection_id_remote_id_key" ON "crm_opportunities"("connection_id", "remote_id");

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_converted_account_id_fkey" FOREIGN KEY ("converted_account_id") REFERENCES "crm_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_converted_contact_id_fkey" FOREIGN KEY ("converted_contact_id") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
