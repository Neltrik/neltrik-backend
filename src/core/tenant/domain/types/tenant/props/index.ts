import type { TenantStatus, TenantType } from "..";

interface TenantProps {
    id: string;
    name: string;
    slug: string;
    type: TenantType;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
}

export type TenantState = TenantProps & {
    status: TenantStatus;
};
