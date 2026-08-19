import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyPasswordError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_PASSWORD, DOMAIN_ERROR_CODES.EMPTY_PASSWORD);
    }
}
