import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyTokenError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_TOKEN, DOMAIN_ERROR_CODES.EMPTY_TOKEN);
    }
}
