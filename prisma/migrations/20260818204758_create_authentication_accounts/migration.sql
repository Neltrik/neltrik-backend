-- CreateTable
CREATE TABLE "authentication_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentication_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authentication_accounts_user_id_key" ON "authentication_accounts"("user_id");

-- CreateIndex
CREATE INDEX "authentication_accounts_email_idx" ON "authentication_accounts"("email");

-- CreateIndex
CREATE INDEX "authentication_accounts_provider_idx" ON "authentication_accounts"("provider");
