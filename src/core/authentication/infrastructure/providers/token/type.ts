import { type UserState } from "@/shared/auth";

export type AccessTokenPayload = {
    userId: string;
    email: string;
    tenantId: string;
    roleCode: string;
    emailVerified: boolean;
    sessionId: string;
    userState: UserState;
};
