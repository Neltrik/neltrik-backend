import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidPermissionDescriptionError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_PERMISSION_DESCRIPTION, DOMAIN_ERROR_CODES.INVALID_PERMISSION_DESCRIPTION);
    }
}
