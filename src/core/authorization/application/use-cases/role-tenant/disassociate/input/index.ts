export interface DisassociateRolesFromTenantInput {
    actorTenantId: string | undefined;
    targetTenantId: string;
    roleIds: string[];
}
