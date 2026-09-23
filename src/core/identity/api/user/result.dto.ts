import { type ResourceStatus } from "@/types/index";

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
    status!: ResourceStatus;
    createdAt!: Date;
    updatedAt!: Date;
    suspendedAt!: Date | null;
}
