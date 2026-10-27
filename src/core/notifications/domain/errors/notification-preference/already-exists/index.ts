import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationPreferenceAlreadyExistsError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_PREFERENCE_ALREADY_EXISTS,
            DOMAIN_ERROR_CODES.NOTIFICATION_PREFERENCE_ALREADY_EXISTS,
        );
    }
}
