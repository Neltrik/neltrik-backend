export interface DisassociateRolesFromTenantInput {
    actorTenantId: string;
    targetTenantId: string;
    roleIds: string[];
}
