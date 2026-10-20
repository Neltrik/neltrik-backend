export const NOTIFICATION_CODES = {
    // Authentication
    RESET_PASSWORD: "RESET_PASSWORD",
    WELCOME: "WELCOME",
    EMAIL_VERIFICATION: "EMAIL_VERIFICATION",

    // Tenant
    INVITATION: "INVITATION",
} as const;
export type NotificationCode = (typeof NOTIFICATION_CODES)[keyof typeof NOTIFICATION_CODES];
