-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "crm_accounts" ALTER COLUMN "owner" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "industry" SET DATA TYPE TEXT,
ALTER COLUMN "website" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "crm_leads" ALTER COLUMN "owner" SET DATA TYPE TEXT,
ALTER COLUMN "lead_source" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "company" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "crm_opportunities" ALTER COLUMN "owner" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "stage" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT;
