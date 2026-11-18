import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class MembershipNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND, DOMAIN_ERROR_CODES.MEMBERSHIP_NOT_FOUND);
    }
}
