import { InvalidClosingDateError, InvalidSalaryError, InvalidTitleError } from "../../errors";
import type { EmploymentType, VacancyState, VacancyStatus, WorkMode } from "../../types";
import { VACANCY_STATUS } from "../../types";

export class Vacancy {
    private readonly props: VacancyState;

    constructor(props: Omit<VacancyState, "status">) {
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
        if (title.trim() === "") {
            throw new InvalidTitleError();
        }
    }

    private ensureClosingDateIsAfterCreatedAt(closingDate: Date, createdAt: Date): void {
        if (closingDate <= createdAt) {
            throw new InvalidClosingDateError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get title(): string {
        return this.props.title;
    }

    public get description(): string {
        return this.props.description;
    }

    public get companyId(): string {
        return this.props.companyId;
    }

    public get recruiterId(): string {
        return this.props.recruiterId;
    }

    public get employmentType(): EmploymentType {
        return this.props.employmentType;
    }

    public get workMode(): WorkMode {
        return this.props.workMode;
    }

    public get closingDate(): Date {
        return this.props.closingDate;
    }

    public get status(): VacancyStatus {
        return this.props.status;
    }

    public get salary(): number | null {
        return this.props.salary;
    }

    public get location(): string | null {
        return this.props.location;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public get deletedAt(): Date | null {
        return this.props.deletedAt;
    }
}
