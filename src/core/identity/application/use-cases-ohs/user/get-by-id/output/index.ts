import { type UserStatus } from "../../../../../domain/types";
import { type Email } from "../../../../../domain/value-objects";

export type GetUserByIdOhsOutput = {
    id: string;
    firstName: string;
    lastName: string;
    email: Email;
    tenantId: string;
    roleId: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
};
