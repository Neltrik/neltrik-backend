import type { Vacancy as PrismaVacancy } from "@prisma/client";
import { Prisma } from "@prisma/client";

import type { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyMapper } from "./index";

const makeVacancyEntity = (): Vacancy =>
    ({
        id: "vacancy-id",
        title: "Backend Developer",
        description: "Develop backend services.",
        tenantId: "tenant-id",
        recruiterId: "recruiter-id",
        employmentType: "FULL_TIME",
        workMode: "REMOTE",
        closingDate: new Date("2026-12-31"),
        status: "OPEN",
        salary: 5000,
        location: "Colombia",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
        deletedAt: null,
    }) as unknown as Vacancy;

const makePersistenceVacancy = (): PrismaVacancy => ({
    id: "vacancy-id",
    title: "Backend Developer",
    description: "Description",
    tenantId: "tenant-id",
    recruiterId: "recruiter-id",
    employmentType: "FULL_TIME",
    workMode: "REMOTE",
    closingDate: new Date("2026-12-31"),
    status: "PUBLISHED",
    salary: new Prisma.Decimal(5000),
    location: "Remote",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    deletedAt: null,
});

describe("VacancyMapper", () => {
    describe("toPersistence", () => {
        it("should map a vacancy entity to persistence model", () => {
            const vacancy = makeVacancyEntity();

            expect(VacancyMapper.toPersistence(vacancy)).toEqual(vacancy);
        });
    });

    describe("toDomain", () => {
        it("should map persistence model to domain entity", () => {
            const persistenceVacancy = makePersistenceVacancy();
            const vacancy = VacancyMapper.toDomain(persistenceVacancy);
            expect(vacancy.id).toBe(persistenceVacancy.id);
            expect(vacancy.tenantId).toBe(persistenceVacancy.tenantId);
            expect(vacancy.salary).toBe(5000);
            expect(vacancy.status).toBe(persistenceVacancy.status);
        });
    });

    it("should map null salary to domain entity", () => {
        const persistenceVacancy = {
            id: "vacancy-id",
            title: "Backend Developer",
            description: "Description",
            tenantId: "tenant-id",
            recruiterId: "recruiter-id",
            employmentType: "FULL_TIME",
            workMode: "REMOTE",
            closingDate: new Date("2026-12-31"),
            status: "PUBLISHED",
            salary: null,
            location: "Remote",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-02"),
            deletedAt: null,
        } satisfies PrismaVacancy;
        const vacancy = VacancyMapper.toDomain(persistenceVacancy);
        expect(vacancy.salary).toBeNull();
    });
});
