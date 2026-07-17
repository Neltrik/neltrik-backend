import { InvalidClosingDateError, InvalidSalaryError, InvalidTitleError } from "../../errors";
import { EMPLOYMENT_TYPE, VACANCY_STATUS, type VacancyState, WORK_MODE } from "../../types";
import { Vacancy } from "./index";

const createProps = (): Omit<VacancyState, "status"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");

    return {
        id: "vacancy-id",
        title: "Backend Developer",
        description: "Description",
        companyId: "company-id",
        recruiterId: "recruiter-id",
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.REMOTE,
        closingDate: new Date("2025-01-31T00:00:00.000Z"),
        salary: 5000,
        location: "Bogotá",
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    };
};

describe("Vacancy", () => {
    it("should create a vacancy with draft status", () => {
        const vacancy = new Vacancy(createProps());

        expect(vacancy.status).toBe(VACANCY_STATUS.DRAFT);
    });

    it("should throw InvalidSalaryError when salary is negative", () => {
        const props = createProps();
        props.salary = -1;

        expect(() => new Vacancy(props)).toThrow(InvalidSalaryError);
    });

    it("should allow null salary", () => {
        const props = createProps();
        props.salary = null;

        expect(() => new Vacancy(props)).not.toThrow();
    });

    it("should throw InvalidTitleError when title is empty", () => {
        const props = createProps();
        props.title = "";

        expect(() => new Vacancy(props)).toThrow(InvalidTitleError);
    });

    it("should throw InvalidTitleError when title contains only spaces", () => {
        const props = createProps();
        props.title = "   ";

        expect(() => new Vacancy(props)).toThrow(InvalidTitleError);
    });

    it("should throw InvalidClosingDateError when closing date is before created date", () => {
        const props = createProps();
        props.closingDate = new Date("2024-12-31T00:00:00.000Z");

        expect(() => new Vacancy(props)).toThrow(InvalidClosingDateError);
    });

    it("should throw InvalidClosingDateError when closing date equals created date", () => {
        const props = createProps();
        props.closingDate = props.createdAt;

        expect(() => new Vacancy(props)).toThrow(InvalidClosingDateError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const vacancy = new Vacancy(props);

        expect(vacancy.id).toBe(props.id);
        expect(vacancy.title).toBe(props.title);
        expect(vacancy.description).toBe(props.description);
        expect(vacancy.companyId).toBe(props.companyId);
        expect(vacancy.recruiterId).toBe(props.recruiterId);
        expect(vacancy.employmentType).toBe(props.employmentType);
        expect(vacancy.workMode).toBe(props.workMode);
        expect(vacancy.closingDate).toEqual(props.closingDate);
        expect(vacancy.salary).toBe(props.salary);
        expect(vacancy.location).toBe(props.location);
        expect(vacancy.createdAt).toEqual(props.createdAt);
        expect(vacancy.updatedAt).toEqual(props.updatedAt);
        expect(vacancy.deletedAt).toBeNull();
        expect(vacancy.status).toBe(VACANCY_STATUS.DRAFT);
    });
});
