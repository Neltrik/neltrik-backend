export const ERROR_MESSAGES = {
    INVALID_SALARY: "Salary cannot be negative.",
    INVALID_TITLE: "Title cannot be empty.",
    INVALID_CLOSING_DATE: "Closing date must be after created date.",
    VACANCY_NOT_FOUND: "Vacancy not found.",
    VACANCY_CANNOT_BE_UPDATED: "Vacancy cannot be updated.",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_SALARY: "INVALID_SALARY",
    INVALID_TITLE: "INVALID_TITLE",
    INVALID_CLOSING_DATE: "INVALID_CLOSING_DATE",
    VACANCY_NOT_FOUND: "VACANCY_NOT_FOUND",
    VACANCY_CANNOT_BE_UPDATED: "VACANCY_CANNOT_BE_UPDATED",
} as const;
