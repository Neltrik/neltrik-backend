import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class CannotSuspendHigherRoleError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.CANNOT_SUSPEND_HIGHER_ROLE, DOMAIN_ERROR_CODES.CANNOT_SUSPEND_HIGHER_ROLE);
    }
}
