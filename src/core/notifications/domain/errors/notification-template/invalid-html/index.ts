import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidTemplateHtmlError extends DomainError {
    constructor(errors: string[]) {
        super(`${ERROR_MESSAGES.INVALID_TEMPLATE_HTML} ${errors.join(", ")}`, DOMAIN_ERROR_CODES.INVALID_TEMPLATE_HTML);
    }
}
