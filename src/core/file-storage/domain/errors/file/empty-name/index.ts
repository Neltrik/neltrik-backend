import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyFileNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_FILE_NAME, DOMAIN_ERROR_CODES.EMPTY_FILE_NAME);
    }
}
