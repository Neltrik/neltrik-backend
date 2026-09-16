import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyResourceError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_RESOURCE, DOMAIN_ERROR_CODES.EMPTY_RESOURCE);
    }
}
