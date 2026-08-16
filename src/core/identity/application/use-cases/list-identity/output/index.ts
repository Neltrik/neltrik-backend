import { type UserStatus } from "../../../../domain/types";
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
    status: UserStatus;
    suspendedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
