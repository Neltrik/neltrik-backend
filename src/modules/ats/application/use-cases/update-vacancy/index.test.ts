import { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyNotFoundError } from "../../../domain/errors";
import { VacancyRepositorySpy } from "../../../test-doubles";
import { UpdateVacancyUseCase } from "./index";
import type { UpdateVacancyInput } from "./input";

const makeInput = (): UpdateVacancyInput => ({
    id: "vacancy-id",
    title: "Senior Backend Developer",
    description: "Updated description",
    employmentType: "PART_TIME",
    workMode: "HYBRID",
    closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    salary: 8000,
    location: "Medellín",
});

const makeVacancy = () =>
    Vacancy.create({
        id: "vacancy-id",
        title: "Backend Developer",
        description: "Description",
        tenantId: "tenant-id",
        recruiterId: "recruiter-id",
        employmentType: "FULL_TIME",
        workMode: "REMOTE",
        closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        salary: 5000,
        location: "Remote",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    });

describe("UpdateVacancyUseCase", () => {
    const makeSut = () => {
        const vacancyRepository = new VacancyRepositorySpy();
        const useCase = new UpdateVacancyUseCase(vacancyRepository);
        return { useCase, vacancyRepository };
    };

    it("should update a vacancy successfully", async () => {
        const { useCase, vacancyRepository } = makeSut();
        const vacancy = makeVacancy();
        vacancyRepository.get.mockResolvedValue(vacancy);
        vacancyRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute(makeInput());
        expect(vacancyRepository.get).toHaveBeenCalledWith("vacancy-id");
        expect(vacancyRepository.update).toHaveBeenCalledWith(vacancy);
        expect(result).toEqual({
            id: "vacancy-id",
        });
    });

    it("should throw VacancyNotFoundError when vacancy does not exist", async () => {
        const { useCase, vacancyRepository } = makeSut();
        vacancyRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(VacancyNotFoundError);
        expect(vacancyRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, vacancyRepository } = makeSut();
        const vacancy = makeVacancy();
        vacancyRepository.get.mockResolvedValue(vacancy);
        vacancyRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
