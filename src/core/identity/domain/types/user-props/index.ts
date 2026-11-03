import { type ResourceStatus } from "@/types/index";

import type { Email } from "../../value-objects";

interface UserProps {
    id: string;
    firstName: string;
    lastName: string;
    email: Email;
    tenantId: string;
    roleId: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
}

export type UserState = UserProps & {
    status: ResourceStatus;
};
