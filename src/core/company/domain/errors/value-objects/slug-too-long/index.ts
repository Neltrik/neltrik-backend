import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class CompanySlugTooLongError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.COMPANY_SLUG_TOO_LONG, DOMAIN_ERROR_CODES.COMPANY_SLUG_TOO_LONG);
    }
}
