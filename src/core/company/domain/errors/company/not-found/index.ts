import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class CompanyNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.COMPANY_NOT_FOUND, DOMAIN_ERROR_CODES.COMPANY_NOT_FOUND);
    }
}
