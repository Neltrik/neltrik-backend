import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidInvitationStatusError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_INVITATION_STATUS, DOMAIN_ERROR_CODES.INVALID_INVITATION_STATUS);
    }
}
