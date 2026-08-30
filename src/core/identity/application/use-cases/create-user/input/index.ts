export interface RegisterUserInput {
    firstName: string;
    lastName: string;
    email: string;
    tenantId: string | undefined;
    roleId: string;
}
