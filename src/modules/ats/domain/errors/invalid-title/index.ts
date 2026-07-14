import { ERROR_MESSAGES } from "../messages";

export class InvalidTitleError extends Error {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TITLE);
        this.name = InvalidTitleError.name;
    }
}
