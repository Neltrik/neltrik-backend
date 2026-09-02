-- CreateTable
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL,
    "authentication_account_id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_verifications_authentication_account_id_idx" ON "email_verifications"("authentication_account_id");

-- CreateIndex
CREATE INDEX "email_verifications_token_hash_idx" ON "email_verifications"("token_hash");

-- CreateIndex
CREATE INDEX "email_verifications_expires_at_idx" ON "email_verifications"("expires_at");

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_authentication_account_id_fkey" FOREIGN KEY ("authentication_account_id") REFERENCES "authentication_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
