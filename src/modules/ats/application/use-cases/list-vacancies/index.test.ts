import type { Vacancy } from "../../../domain/entities/vacancy";
import { VacancyRepositorySpy } from "../../../test-doubles";
import { ListVacanciesUseCase } from "./index";

describe("ListVacanciesUseCase", () => {
    const makeSut = () => {
        const vacancies: Vacancy[] = [];
        const vacancyRepository = new VacancyRepositorySpy();
        vacancyRepository.list.mockResolvedValue(vacancies);
        const useCase = new ListVacanciesUseCase(vacancyRepository);
        return { useCase, vacancyRepository, vacancies };
    };

    it("should list vacancies successfully", async () => {
        const { useCase, vacancyRepository, vacancies } = makeSut();
        const result = await useCase.execute();
        expect(vacancyRepository.list).toHaveBeenCalledTimes(1);
        expect(result).toEqual(vacancies);
    });

    it("should propagate repository errors", async () => {
        const { useCase, vacancyRepository } = makeSut();
        vacancyRepository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute()).rejects.toThrow("Database error");
    });
});
