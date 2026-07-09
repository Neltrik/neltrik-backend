export const VACANCY_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    CLOSED: "CLOSED",
    ARCHIVED: "ARCHIVED",
} as const;

export type VacancyStatus = (typeof VACANCY_STATUS)[keyof typeof VACANCY_STATUS];
