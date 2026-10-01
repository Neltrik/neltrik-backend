import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidFileVersionsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_FILE_VERSIONS, DOMAIN_ERROR_CODES.INVALID_FILE_VERSIONS);
    }
}
