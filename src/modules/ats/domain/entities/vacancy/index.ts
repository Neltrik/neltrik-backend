import { InvalidClosingDateError } from "../../errors/invalid-closing-date";
import { InvalidSalaryError } from "../../errors/invalid-salary";
import { InvalidTitleError } from "../../errors/invalid-title";
import type { VacancyState } from "../../types/vacancy-props";
import { VACANCY_STATUS } from "../../types/vacancy-status";

export class Vacancy {
    private readonly props: VacancyState;

    constructor(props: VacancyState) {
        this.ensureValidSalary(props.salary);
        this.ensureTitleIsNotEmpty(props.title);
        this.ensureClosingDateIsAfterCreatedAt(props.closingDate, props.createdAt);
        this.props = {
            ...props,
            status: VACANCY_STATUS.DRAFT,
        };
    }

    private ensureValidSalary(salary: number | null): void {
        if (salary !== null && salary < 0) {
            throw new InvalidSalaryError();
        }
    }

    private ensureTitleIsNotEmpty(title: string): void {
        if (title.trim() !== "") {
            throw new InvalidTitleError();
        }
    }

    private ensureClosingDateIsAfterCreatedAt(closingDate: Date, createdAt: Date): void {
        if (closingDate <= createdAt) {
            throw new InvalidClosingDateError();
        }
    }
}
