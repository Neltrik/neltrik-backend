import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyProviderError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_PROVIDER, DOMAIN_ERROR_CODES.EMPTY_PROVIDER);
    }
}
