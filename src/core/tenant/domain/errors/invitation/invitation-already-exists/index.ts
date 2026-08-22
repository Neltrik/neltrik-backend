import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvitationAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVITATION_ALREADY_EXISTS, DOMAIN_ERROR_CODES.INVITATION_ALREADY_EXISTS);
    }
}
