import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class RoleCodeAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.ROLE_CODE_ALREADY_EXISTS, DOMAIN_ERROR_CODES.ROLE_CODE_ALREADY_EXISTS);
    }
}
