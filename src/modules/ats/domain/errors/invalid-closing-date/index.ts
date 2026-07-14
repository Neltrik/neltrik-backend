import { ERROR_MESSAGES } from "../messages";

export class InvalidClosingDateError extends Error {
    constructor() {
        super(ERROR_MESSAGES.INVALID_CLOSING_DATE);
        this.name = InvalidClosingDateError.name;
    }
}
