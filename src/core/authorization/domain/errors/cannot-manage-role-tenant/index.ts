import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class CannotManageRoleTenantError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.CANNOT_MANAGE_ROLE_TENANT, DOMAIN_ERROR_CODES.CANNOT_MANAGE_ROLE_TENANT);
    }
}
