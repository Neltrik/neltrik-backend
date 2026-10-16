import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationChannelsRequiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_CHANNELS_REQUIRED, DOMAIN_ERROR_CODES.NOTIFICATION_CHANNELS_REQUIRED);
    }
}
