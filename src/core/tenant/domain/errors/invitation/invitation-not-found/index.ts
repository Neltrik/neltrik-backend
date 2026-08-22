import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvitationNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVITATION_NOT_FOUND, DOMAIN_ERROR_CODES.INVITATION_NOT_FOUND);
    }
}
