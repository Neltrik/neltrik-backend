import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class TenantRoleConfigurationNotFoundError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.TENANT_ROLE_CONFIGURATION_NOT_FOUND,
            DOMAIN_ERROR_CODES.TENANT_ROLE_CONFIGURATION_NOT_FOUND,
        );
    }
}
