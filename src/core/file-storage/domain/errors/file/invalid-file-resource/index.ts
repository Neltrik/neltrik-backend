import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidFileResourceError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_FILE_RESOURCE, DOMAIN_ERROR_CODES.INVALID_FILE_RESOURCE);
    }
}
