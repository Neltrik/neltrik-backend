export interface AssociateRolesToTenantInput {
    actorTenantId: string | undefined;
    targetTenantId: string;
    roleIds: string[];
}
