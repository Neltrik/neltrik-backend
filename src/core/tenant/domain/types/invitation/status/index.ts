export const INVITATION_STATUS = {
    PENDING: "PENDING",
    USED: "USED",
    REVOKED: "REVOKED",
    EXPIRED: "EXPIRED",
} as const;

export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];
