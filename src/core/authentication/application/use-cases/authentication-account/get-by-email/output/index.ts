export interface GetAuthenticationAccountByEmailOutput {
    id: string;
    userId: string;
    provider: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
