export interface GetAuthenticationAccountByUserIdOutput {
    id: string;
    userId: string;
    provider: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
