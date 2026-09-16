import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyActionError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_ACTION, DOMAIN_ERROR_CODES.EMPTY_ACTION);
    }
}
