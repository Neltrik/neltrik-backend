import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidTitleError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TITLE, DOMAIN_ERROR_CODES.INVALID_TITLE);
    }
}
