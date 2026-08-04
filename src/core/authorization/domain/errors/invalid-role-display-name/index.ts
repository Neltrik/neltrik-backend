import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidRoleDisplayNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_ROLE_DISPLAY_NAME, DOMAIN_ERROR_CODES.INVALID_ROLE_DISPLAY_NAME);
    }
}
