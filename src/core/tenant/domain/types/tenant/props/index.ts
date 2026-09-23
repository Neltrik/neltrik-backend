import { type ResourceStatus } from "@/types/index";

import type { TenantType } from "../";

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
    status: ResourceStatus;
};
