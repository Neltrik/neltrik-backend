-- CreateTable
CREATE TABLE "authentication_sessions" (
    "id" UUID NOT NULL,
    "authentication_account_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentication_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "authentication_sessions_authentication_account_id_idx" ON "authentication_sessions"("authentication_account_id");

-- CreateIndex
CREATE INDEX "authentication_sessions_expires_at_idx" ON "authentication_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "authentication_sessions_refresh_token_hash_idx" ON "authentication_sessions"("refresh_token_hash");

-- AddForeignKey
ALTER TABLE "authentication_sessions" ADD CONSTRAINT "authentication_sessions_authentication_account_id_fkey" FOREIGN KEY ("authentication_account_id") REFERENCES "authentication_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
