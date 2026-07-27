import { type TenantStatus } from "../";

interface TenantProps {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
}

export type TenantState = TenantProps & {
    status: TenantStatus;
};
