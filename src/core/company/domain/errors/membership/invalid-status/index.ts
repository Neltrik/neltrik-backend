import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidMembershipStatusError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.MEMBERSHIP_STATUS_INVALID, DOMAIN_ERROR_CODES.MEMBERSHIP_STATUS_INVALID);
    }
}
