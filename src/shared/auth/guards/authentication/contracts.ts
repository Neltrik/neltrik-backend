import { type ResourceStatus } from "@/types/index";

export type SessionResolution = {
    isValid: boolean;
    userState: { status: ResourceStatus };
    accountState: { emailVerified: boolean };
};

export abstract class SessionValidator {
    public abstract resolve(sessionId: string): Promise<SessionResolution>;
}
