import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidRoleCodeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_ROLE_CODE, DOMAIN_ERROR_CODES.INVALID_ROLE_CODE);
    }
}
