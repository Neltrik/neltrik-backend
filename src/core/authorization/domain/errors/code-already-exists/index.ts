import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class CodeAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.CODE_ALREADY_EXISTS, DOMAIN_ERROR_CODES.CODE_ALREADY_EXISTS);
    }
}
