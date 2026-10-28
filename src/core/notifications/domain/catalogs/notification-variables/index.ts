export const NOTIFICATION_VARIABLES = {
    RESET_PASSWORD: ["name", "email", "resetUrl", "tenantName"],
    EMAIL_VERIFICATION: ["name", "email", "verificationUrl", "tenantName"],
    INVITATION: ["inviterName", "tenantName", "invitationUrl"],
    WELCOME: ["name", "tenantName"],
} as const;
export type NotificationVariable = (typeof NOTIFICATION_VARIABLES)[keyof typeof NOTIFICATION_VARIABLES][number];
