import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class MembershipAlreadyRevokedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.MEMBERSHIP_ALREADY_REVOKED, DOMAIN_ERROR_CODES.MEMBERSHIP_ALREADY_REVOKED);
    }
}
