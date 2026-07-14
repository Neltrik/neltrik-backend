import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidSalaryError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_SALARY, DOMAIN_ERROR_CODES.INVALID_SALARY);
    }
}
