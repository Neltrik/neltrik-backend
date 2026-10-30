import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidTemplateVariableError extends DomainError {
    constructor(variables: string[]) {
        super(
            ERROR_MESSAGES.INVALID_TEMPLATE_VARIABLE,
            DOMAIN_ERROR_CODES.INVALID_TEMPLATE_VARIABLE,
            variables.map((variable) => ({
                code: DOMAIN_ERROR_CODES.INVALID_TEMPLATE_VARIABLE,
                message: variable,
            })),
        );
    }
}
