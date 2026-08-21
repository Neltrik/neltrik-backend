import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvitationAlreadyRevokedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVITATION_ALREADY_REVOKED, DOMAIN_ERROR_CODES.INVITATION_ALREADY_REVOKED);
    }
}
