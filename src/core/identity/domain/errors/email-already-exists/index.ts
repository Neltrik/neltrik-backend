import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class EmailAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, DOMAIN_ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }
}
