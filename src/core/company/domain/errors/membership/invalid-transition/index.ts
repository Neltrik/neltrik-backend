import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidMembershipTransitionError extends DomainError {
    constructor(status: string) {
        super(ERROR_MESSAGES.MEMBERSHIP_TRANSITION_INVALID, DOMAIN_ERROR_CODES.MEMBERSHIP_TRANSITION_INVALID, [
            {
                code: "MEMBERSHIP_CANNOT_CHANGE_ROLE",
                message: `Cannot perform this action on a membership with status ${status}`,
            },
        ]);
    }
}
