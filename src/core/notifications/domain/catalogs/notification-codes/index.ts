export const NOTIFICATION_CODES = {
    // Authentication
    RESET_PASSWORD: "RESET_PASSWORD",
    EMAIL_VERIFICATION: "EMAIL_VERIFICATION",

    // Tenant
    INVITATION: "INVITATION",

    // Marketing
    WELCOME: "WELCOME",
} as const;
export type NotificationCode = (typeof NOTIFICATION_CODES)[keyof typeof NOTIFICATION_CODES];
