import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class TenantAlreadyActiveError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.TENANT_ALREADY_ACTIVE, DOMAIN_ERROR_CODES.TENANT_ALREADY_ACTIVE);
    }
}
