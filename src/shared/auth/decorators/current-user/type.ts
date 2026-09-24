import { type TenantState } from "@/shared/tenant";
import { type ResourceStatus } from "@/types/index";

export type UserState = {
    status: ResourceStatus;
};

export type UserPayload = {
    userId: string;
    tenantId: string;
    roleCode: string;
    sessionId: string;
    userState: UserState;
    tenantState: TenantState;
};
