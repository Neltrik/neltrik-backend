import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidFileExtensionError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_FILE_EXTENSION, DOMAIN_ERROR_CODES.INVALID_FILE_EXTENSION);
    }
}
