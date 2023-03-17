-- CreateTable
CREATE TABLE "sg_users" (
    "id" TEXT NOT NULL,
    "auth_type" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sg_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sg_users_application_id_username_key" ON "sg_users"("application_id", "username");

-- AddForeignKey
ALTER TABLE "sg_users" ADD CONSTRAINT "sg_users_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
