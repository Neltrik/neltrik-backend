import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidCompanyStatusError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_COMPANY_STATUS, DOMAIN_ERROR_CODES.INVALID_COMPANY_STATUS);
    }
}
