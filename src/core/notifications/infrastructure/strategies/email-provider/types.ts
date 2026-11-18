export const EMAIL_PROVIDER = {
    NODEMAILER: "NODEMAILER",
} as const;
export type EmailProvider = (typeof EMAIL_PROVIDER)[keyof typeof EMAIL_PROVIDER];
