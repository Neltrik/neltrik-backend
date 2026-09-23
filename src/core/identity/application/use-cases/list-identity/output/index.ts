import { type ResourceStatus } from "@/types/index";

import { type Email } from "../../../../domain/value-objects";

export type GetUsersOutput = {
    id: string;
    firstName: string;
    lastName: string;
    email: Email;
    tenantId: string;
    role: {
        id: string;
        code: string;
        scope: string;
    };
    status: ResourceStatus;
    suspendedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
