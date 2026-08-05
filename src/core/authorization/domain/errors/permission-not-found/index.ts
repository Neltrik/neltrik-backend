import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class PermissionNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.PERMISSION_NOT_FOUND, DOMAIN_ERROR_CODES.PERMISSION_NOT_FOUND);
    }
}
