export type AuthenticationInput<TCredentials = unknown> = {
    provider: string;
    credentials: TCredentials;
};

export type AuthenticationResult = {
    authenticated: boolean;
};
