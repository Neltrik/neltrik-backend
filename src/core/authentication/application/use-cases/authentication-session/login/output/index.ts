export interface LoginOutput {
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
}
