export interface CreateInvitationInput {
    tenantId: string | undefined;
    roleId: string;
    recipient: string;
    mechanism: string;
}
