import { type ResourceStatus } from "@/types/index";

export type UserState = {
    status: ResourceStatus;
};

type TenantState = {
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
