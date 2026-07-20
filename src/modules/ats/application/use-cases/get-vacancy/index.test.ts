import { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyNotFoundError } from "../../../domain/errors";
import { VacancyRepositorySpy } from "../../../test-doubles";
import { GetVacancyUseCase } from "./index";

describe("GetVacancyUseCase", () => {
    const makeVacancy = () =>
        Vacancy.restore({
            id: "vacancy-id",
            title: "Backend Developer",
            description: "Description",
            tenantId: "tenant-id",
            recruiterId: "recruiter-id",
            employmentType: "FULL_TIME",
            workMode: "REMOTE",
            closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            status: "DRAFT",
            salary: 5000,
            location: "Remote",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });

    const makeSut = () => {
        const vacancy = makeVacancy();
        const vacancyRepository = new VacancyRepositorySpy();
        vacancyRepository.get.mockResolvedValue(vacancy);
        const useCase = new GetVacancyUseCase(vacancyRepository);
        return { useCase, vacancyRepository, vacancy };
    };

    it("should return a vacancy successfully", async () => {
        const { useCase, vacancyRepository, vacancy } = makeSut();
        const result = await useCase.execute("vacancy-id");
        expect(vacancyRepository.get).toHaveBeenCalledTimes(1);
        expect(vacancyRepository.get).toHaveBeenCalledWith("vacancy-id");
        expect(result).toBe(vacancy);
    });

    it("should throw VacancyNotFoundError when vacancy does not exist", async () => {
        const { useCase, vacancyRepository } = makeSut();
        vacancyRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("vacancy-id")).rejects.toThrow(VacancyNotFoundError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, vacancyRepository } = makeSut();
        vacancyRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("vacancy-id")).rejects.toThrow("Database error");
    });
});
