import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationCannotBeMarkedAsReadError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_CANNOT_BE_MARKED_AS_READ,
            DOMAIN_ERROR_CODES.NOTIFICATION_CANNOT_BE_MARKED_AS_READ,
        );
    }
}
