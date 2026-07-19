import type { IdGenerator } from "@/shared/id-generator";

import { InvalidTitleError } from "../../../domain/errors";
import { type VacancyRepository } from "../../../domain/interfaces/vacancy-repository";
import { CreateVacancyUseCase } from "./index";
import type { CreateVacancyInput } from "./input";

const makeInput = (): CreateVacancyInput => ({
    title: "Backend Developer",
    description: "Description",
    tenantId: "tenant-id",
    recruiterId: "recruiter-id",
    employmentType: "FULL_TIME",
    workMode: "REMOTE",
    closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    salary: 5000,
    location: "Remote",
});

describe("CreateVacancyUseCase", () => {
    const makeSut = () => {
        const createMock = jest.fn().mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("vacancy-id");

        const vacancyRepository = {
            create: createMock,
        } satisfies VacancyRepository;

        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;

        const useCase = new CreateVacancyUseCase(vacancyRepository, idGenerator);

        return {
            useCase,
            createMock,
            generateMock,
        };
    };

    it("should create a vacancy successfully", async () => {
        const { useCase, createMock, generateMock } = makeSut();

        const result = await useCase.execute(makeInput());

        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "vacancy-id" });
    });

    it("should propagate domain errors", async () => {
        const { useCase, createMock } = makeSut();

        const input = makeInput();
        input.title = "";

        await expect(useCase.execute(input)).rejects.toThrow(InvalidTitleError);

        expect(createMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, createMock } = makeSut();

        createMock.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
