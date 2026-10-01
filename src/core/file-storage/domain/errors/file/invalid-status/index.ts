import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidFileStatusError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_FILE_STATUS, DOMAIN_ERROR_CODES.INVALID_FILE_STATUS);
    }
}
