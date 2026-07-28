import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class TenantNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.TENANT_NOT_FOUND, DOMAIN_ERROR_CODES.TENANT_NOT_FOUND);
    }
}
