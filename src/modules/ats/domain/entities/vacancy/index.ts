import { InvalidClosingDateError, InvalidSalaryError, InvalidTitleError, VacancyNotEditableError } from "../../errors";
import type { EmploymentType, UpdateVacancyProps, VacancyState, VacancyStatus, WorkMode } from "../../types";
import { VACANCY_STATUS } from "../../types";

export class Vacancy {
    private readonly props: VacancyState;

    private constructor(props: VacancyState) {
        this.ensureValidSalary(props.salary);
        this.ensureTitleIsNotEmpty(props.title);
        this.ensureClosingDateIsAfterCreatedAt(props.closingDate, props.createdAt);
        this.props = props;
    }

    public static create(props: Omit<VacancyState, "status">): Vacancy {
        return new Vacancy({
            ...props,
            status: VACANCY_STATUS.DRAFT,
        });
    }

    public static restore(props: VacancyState): Vacancy {
        return new Vacancy(props);
    }

    public update(props: UpdateVacancyProps): void {
        this.ensureCanBeUpdated();
        this.ensureTitleIsNotEmpty(props.title);
        this.ensureClosingDateIsAfterCreatedAt(props.closingDate, this.createdAt);
        this.ensureValidSalary(props.salary);
        this.props.title = props.title;
        this.props.description = props.description;
        this.props.employmentType = props.employmentType;
        this.props.workMode = props.workMode;
        this.props.closingDate = props.closingDate;
        this.props.salary = props.salary;
        this.props.location = props.location;
        this.props.updatedAt = new Date();
    }

    private ensureCanBeUpdated(): void {
        if (this.status === VACANCY_STATUS.CLOSED || this.status === VACANCY_STATUS.ARCHIVED) {
            throw new VacancyNotEditableError();
        }
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

    public get tenantId(): string {
        return this.props.tenantId;
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
