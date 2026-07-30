import type { Email } from "../../value-objects";
import { type UserStatus } from "../";

interface UserProps {
    id: string;
    firstName: string;
    lastName: string;
    email: Email;
    tenantId: string;
    roleId: string;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
}

export type UserState = UserProps & {
    status: UserStatus;
};
