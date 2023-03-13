-- CreateTable
CREATE TABLE "crm_users" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" TEXT NOT NULL,

    CONSTRAINT "crm_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_users_connection_id_remote_id_key" ON "crm_users"("connection_id", "remote_id");
