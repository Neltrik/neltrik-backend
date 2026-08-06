import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class EmptyDisplayNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_DISPLAY_NAME, DOMAIN_ERROR_CODES.EMPTY_DISPLAY_NAME);
    }
}
