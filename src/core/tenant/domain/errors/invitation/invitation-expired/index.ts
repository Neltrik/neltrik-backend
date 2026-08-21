import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvitationExpiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVITATION_EXPIRED, DOMAIN_ERROR_CODES.INVITATION_EXPIRED);
    }
}
