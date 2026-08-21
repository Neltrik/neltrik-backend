import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidTenantSlugError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TENANT_SLUG, DOMAIN_ERROR_CODES.INVALID_TENANT_SLUG);
    }
}
