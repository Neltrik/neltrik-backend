-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateTable
CREATE TABLE "vacancies" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "recruiter_id" UUID NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "work_mode" "WorkMode" NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "salary" DECIMAL(12,2),
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vacancies_tenant_id_idx" ON "vacancies"("tenant_id");

-- CreateIndex
CREATE INDEX "vacancies_recruiter_id_idx" ON "vacancies"("recruiter_id");

-- CreateIndex
CREATE INDEX "vacancies_status_idx" ON "vacancies"("status");
