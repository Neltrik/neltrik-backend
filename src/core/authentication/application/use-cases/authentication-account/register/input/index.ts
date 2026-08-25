export interface RegisterInput {
    invitationToken: string;
    provider: string;
    email: string;
    credentials: unknown;
    firstName: string;
    lastName: string;
}
