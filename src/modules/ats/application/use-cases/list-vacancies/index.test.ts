import type { Vacancy } from "../../../domain/entities/vacancy";
import type { VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { ListVacanciesUseCase } from "./index";

describe("ListVacanciesUseCase", () => {
    const makeSut = () => {
        const vacancies: Vacancy[] = [];
        const listMock = jest.fn().mockResolvedValue(vacancies);
        const vacancyRepository = {
            create: jest.fn(),
            list: listMock,
        } satisfies VacancyRepository;
        const useCase = new ListVacanciesUseCase(vacancyRepository);
        return {
            useCase,
            listMock,
            vacancies,
        };
    };

    it("should list vacancies successfully", async () => {
        const { useCase, listMock, vacancies } = makeSut();
        const result = await useCase.execute();
        expect(listMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(vacancies);
    });

    it("should propagate repository errors", async () => {
        const { useCase, listMock } = makeSut();
        listMock.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute()).rejects.toThrow("Database error");
    });
});
