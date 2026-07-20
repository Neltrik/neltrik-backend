import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class VacancyNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.VACANCY_NOT_FOUND, DOMAIN_ERROR_CODES.VACANCY_NOT_FOUND);
    }
}
