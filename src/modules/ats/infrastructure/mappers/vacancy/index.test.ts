import { type Vacancy } from "../../../domain/entities/vacancy";
import { MESSAGES } from "../message";
import { VacancyMapper } from "./index";

describe("VacancyMapper", () => {
    describe("toPersistence", () => {
        it("should map a vacancy entity to persistence model", () => {
            const vacancy = {
                id: "vacancy-id",
                title: "Backend Developer",
                description: "Develop backend services.",
                companyId: "company-id",
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
            } as unknown as Vacancy;
            const result = VacancyMapper.toPersistence(vacancy);
            expect(result).toEqual({
                id: "vacancy-id",
                title: "Backend Developer",
                description: "Develop backend services.",
                companyId: "company-id",
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
            });
        });

        it("should throw an error when method is not implemented", () => {
            expect(() => VacancyMapper.toDomain()).toThrow(MESSAGES.METHOD_NOT_IMPLEMENTED);
        });
    });
});
