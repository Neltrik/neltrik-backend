import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyUserIdError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_USER_ID, DOMAIN_ERROR_CODES.EMPTY_USER_ID);
    }
}
