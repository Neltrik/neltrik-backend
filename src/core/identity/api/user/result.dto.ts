import { type UserStatus } from "../../domain/types";

export class RegisterUserRequestDto {
    firstName!: string;
    lastName!: string;
    email!: string;
    tenantId!: string;
    roleId!: string;
}

export class RegisterUserResultDto {
    id!: string;
}

export class DeleteUserResultDto {
    id!: string;
}

export class GetUserRequestDto {
    id!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    tenantId!: string;
    roleId!: string;
    status!: UserStatus;
    createdAt!: Date;
    updatedAt!: Date;
    suspendedAt!: Date | null;
}
