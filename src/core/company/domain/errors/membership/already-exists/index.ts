import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class MembershipAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.MEMBERSHIP_ALREADY_EXISTS, DOMAIN_ERROR_CODES.MEMBERSHIP_ALREADY_EXISTS);
    }
}
