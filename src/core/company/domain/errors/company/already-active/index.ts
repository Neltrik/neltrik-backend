import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class CompanyAlreadyActiveError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.COMPANY_ALREADY_ACTIVE, DOMAIN_ERROR_CODES.COMPANY_ALREADY_ACTIVE);
    }
}
