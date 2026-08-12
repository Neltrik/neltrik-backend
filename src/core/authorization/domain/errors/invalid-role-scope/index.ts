import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidRoleScopeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_ROLE_SCOPE, DOMAIN_ERROR_CODES.INVALID_ROLE_SCOPE);
    }
}
