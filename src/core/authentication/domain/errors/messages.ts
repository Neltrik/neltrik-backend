export const ERROR_MESSAGES = {
    PASSWORD_TOO_SHORT: "The password is too short.",
    PASSWORD_TOO_LONG: "The password is too long.",
    EMPTY_PASSWORD_HASH: "The password hash cannot be empty.",
    EMPTY_EMAIL: "The email cannot be empty.",
    EMAIL_ALREADY_VERIFIED: "The email is already verified.",
    EMPTY_PROVIDER: "The provider cannot be empty.",
    EMPTY_USER_ID: "The user ID cannot be empty.",
    MISSING_PASSWORD_HASH: "The password hash is missing.",
    INVALID_CREDENTIALS: "Invalid credentials.",
    UNSUPPORTED_PROVIDER: "The provider is not supported.",
} as const;

export const DOMAIN_ERROR_CODES = {
    PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
    PASSWORD_TOO_LONG: "PASSWORD_TOO_LONG",
    EMPTY_PASSWORD_HASH: "EMPTY_PASSWORD_HASH",
    EMPTY_EMAIL: "EMPTY_EMAIL",
    EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
    EMPTY_PROVIDER: "EMPTY_PROVIDER",
    EMPTY_USER_ID: "EMPTY_USER_ID",
    MISSING_PASSWORD_HASH: "MISSING_PASSWORD_HASH",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    UNSUPPORTED_PROVIDER: "UNSUPPORTED_PROVIDER",
} as const;
