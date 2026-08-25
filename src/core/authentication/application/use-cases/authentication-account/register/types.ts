interface RegisterSagaResult {
    userId: string;
    accountId: string;
    email: string;
    emailVerified: boolean;
}

export type RegisterStepResult = string | Partial<RegisterSagaResult> | void;

export interface RegisterSagaContext {
    userId?: string;
    id?: string;
}
