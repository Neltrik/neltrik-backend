import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class DisplayNameTooLongError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.DISPLAY_NAME_TOO_LONG, DOMAIN_ERROR_CODES.DISPLAY_NAME_TOO_LONG);
    }
}
