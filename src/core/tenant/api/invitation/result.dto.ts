export class InvitationResultDto {
    invitationId!: string;
    tenantId!: string;
    roleId!: string;
    recipient!: string;
}

export class ConsumeInvitationResultDto {
    invitationId!: string;
}
