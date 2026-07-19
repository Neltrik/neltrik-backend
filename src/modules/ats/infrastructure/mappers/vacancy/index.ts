import type { Vacancy as PrismaVacancy } from "@prisma/client";

import { Vacancy } from "../../../domain/entities/vacancy";

export class VacancyMapper {
    public static toPersistence(vacancy: Vacancy) {
        return {
            id: vacancy.id,
            title: vacancy.title,
            description: vacancy.description,
            tenantId: vacancy.tenantId,
            recruiterId: vacancy.recruiterId,
            employmentType: vacancy.employmentType,
            workMode: vacancy.workMode,
            closingDate: vacancy.closingDate,
            status: vacancy.status,
            salary: vacancy.salary,
            location: vacancy.location,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
            deletedAt: vacancy.deletedAt,
        };
    }

    public static toDomain(vacancy: PrismaVacancy): Vacancy {
        return Vacancy.restore({
            id: vacancy.id,
            title: vacancy.title,
            description: vacancy.description,
            tenantId: vacancy.tenantId,
            recruiterId: vacancy.recruiterId,
            employmentType: vacancy.employmentType,
            workMode: vacancy.workMode,
            closingDate: vacancy.closingDate,
            status: vacancy.status,
            salary: vacancy.salary?.toNumber() ?? null,
            location: vacancy.location,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
            deletedAt: vacancy.deletedAt,
        });
    }
}
