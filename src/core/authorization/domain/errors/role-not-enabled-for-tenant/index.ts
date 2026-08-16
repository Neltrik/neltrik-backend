import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class RoleNotEnabledForTenantError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.ROLE_NOT_ENABLED_FOR_TENANT, DOMAIN_ERROR_CODES.ROLE_NOT_ENABLED_FOR_TENANT);
    }
}
