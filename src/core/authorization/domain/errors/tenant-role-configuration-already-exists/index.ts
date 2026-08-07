import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class TenantRoleConfigurationAlreadyExistsError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.TENANT_ROLE_CONFIGURATION_ALREADY_EXISTS,
            DOMAIN_ERROR_CODES.TENANT_ROLE_CONFIGURATION_ALREADY_EXISTS,
        );
    }
}
