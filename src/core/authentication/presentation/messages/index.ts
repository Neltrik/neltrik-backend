export const ACCOUNT_MESSAGES = {
    CREATED: "Account created successfully.",
    RETRIEVED: "Account retrieved successfully.",
} as const;

export const AUTH_MESSAGES = {
    LOGIN_SUCCESS: "Login successful.",
    REFRESH_SUCCESS: "Token refreshed successfully.",
    LOGOUT_SUCCESS: "Logout successful.",
    SESSION_REVOKED: "Session revoked successfully.",
} as const;

export const EMAIL_VERIFICATION = {
    EMAIL_VERIFICATION_REQUEST_SUCCESS: "Verification email sent successfully.",
    EMAIL_VERIFICATION_VALIDATE_SUCCESS: "Email verified successfully.",
} as const;

export const PASSWORD_RESET_MESSAGES = {
    REQUEST_SUCCESS: "Password reset email sent successfully.",
    RESET_SUCCESS: "Password reset successfully.",
} as const;
