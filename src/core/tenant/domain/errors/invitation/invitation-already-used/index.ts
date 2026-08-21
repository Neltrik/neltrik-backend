import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvitationAlreadyUsedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVITATION_ALREADY_USED, DOMAIN_ERROR_CODES.INVITATION_ALREADY_USED);
    }
}
