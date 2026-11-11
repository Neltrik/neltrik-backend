import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidCompanySlugFormatError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_COMPANY_SLUG_FORMAT, DOMAIN_ERROR_CODES.INVALID_COMPANY_SLUG_FORMAT);
    }
}
