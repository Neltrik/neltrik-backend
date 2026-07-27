import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidTenantNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TENANT_NAME, DOMAIN_ERROR_CODES.INVALID_TENANT_NAME);
    }
}
