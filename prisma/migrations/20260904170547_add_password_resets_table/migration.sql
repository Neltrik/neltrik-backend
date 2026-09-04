-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "authentication_account_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_resets_authentication_account_id_idx" ON "password_resets"("authentication_account_id");

-- CreateIndex
CREATE INDEX "password_resets_token_hash_idx" ON "password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "password_resets_expires_at_idx" ON "password_resets"("expires_at");

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_authentication_account_id_fkey" FOREIGN KEY ("authentication_account_id") REFERENCES "authentication_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
