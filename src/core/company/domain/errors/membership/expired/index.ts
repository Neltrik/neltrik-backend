import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class MembershipExpiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.MEMBERSHIP_EXPIRED, DOMAIN_ERROR_CODES.MEMBERSHIP_EXPIRED);
    }
}
