-- AlterTable
ALTER TABLE "authentication_sessions" ADD COLUMN     "owner_id" UUID;

-- CreateIndex
CREATE INDEX "authentication_sessions_owner_id_idx" ON "authentication_sessions"("owner_id");

-- AddForeignKey
ALTER TABLE "authentication_sessions" ADD CONSTRAINT "authentication_sessions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
