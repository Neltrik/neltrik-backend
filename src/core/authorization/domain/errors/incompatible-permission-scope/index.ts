import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class IncompatiblePermissionScopeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INCOMPATIBLE_PERMISSION_SCOPE, DOMAIN_ERROR_CODES.INCOMPATIBLE_PERMISSION_SCOPE);
    }
}
