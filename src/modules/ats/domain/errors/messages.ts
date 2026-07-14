export const ERROR_MESSAGES = {
    INVALID_SALARY: "Salary cannot be negative.",
    INVALID_TITLE: "Title cannot be empty.",
    INVALID_CLOSING_DATE: "Closing date must be after created date.",
} as const;

export const DOMAIN_ERROR_CODES = {
    INVALID_SALARY: "INVALID_SALARY",
    INVALID_TITLE: "INVALID_TITLE",
    INVALID_CLOSING_DATE: "INVALID_CLOSING_DATE",
} as const;
