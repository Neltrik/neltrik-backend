export class InvalidTitleError extends Error {
    constructor() {
        super("Title cannot be empty.");
        this.name = "InvalidTitleError";
    }
}
