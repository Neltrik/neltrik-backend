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
