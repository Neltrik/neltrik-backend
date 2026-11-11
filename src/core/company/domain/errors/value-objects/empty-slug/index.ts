import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyCompanySlugError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_COMPANY_SLUG, DOMAIN_ERROR_CODES.EMPTY_COMPANY_SLUG);
    }
}
