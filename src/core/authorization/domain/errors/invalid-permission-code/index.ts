import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidPermissionCodeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_PERMISSION_CODE, DOMAIN_ERROR_CODES.INVALID_PERMISSION_CODE);
    }
}
