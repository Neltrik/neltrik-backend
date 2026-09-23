import { type ResourceStatus } from "@/types/index";

import { type Email } from "../../../../../domain/value-objects";

export type GetUserByIdOhsOutput = {
    id: string;
    firstName: string;
    lastName: string;
    email: Email;
    tenantId: string;
    roleId: string;
    status: ResourceStatus;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
};
