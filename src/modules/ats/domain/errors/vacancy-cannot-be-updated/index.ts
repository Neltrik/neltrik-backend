import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class VacancyNotEditableError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.VACANCY_CANNOT_BE_UPDATED, DOMAIN_ERROR_CODES.VACANCY_CANNOT_BE_UPDATED);
    }
}
