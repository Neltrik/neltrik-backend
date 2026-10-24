import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class TemplateVariableMissingError extends DomainError {
    constructor(variables: string[]) {
        super(
            `${ERROR_MESSAGES.TEMPLATE_VARIABLE_MISSING} ${variables.join(", ")}`,
            DOMAIN_ERROR_CODES.TEMPLATE_VARIABLE_MISSING,
        );
    }
}
