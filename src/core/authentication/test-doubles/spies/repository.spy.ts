import type { TransactionContext } from "@/shared/transaction";

import type { AuthenticationAccount, AuthenticationSession, EmailVerification } from "../../domain/entities";
import {
    AuthenticationAccountRepository,
    AuthenticationSessionRepository,
    EmailVerificationRepository,
} from "../../domain/interfaces";

export class AuthenticationAccountRepositorySpy extends AuthenticationAccountRepository {
    public create = jest.fn<Promise<void>, [AuthenticationAccount]>();
    public findByUserId = jest.fn<Promise<AuthenticationAccount | null>, [string]>();
    public findByEmail = jest.fn<Promise<AuthenticationAccount | null>, [string]>();
    public update = jest.fn<Promise<void>, [AuthenticationAccount]>();
    public delete = jest.fn<Promise<void>, [string]>();
    public findById = jest.fn<Promise<AuthenticationAccount | null>, [string]>();
}

export class AuthenticationSessionRepositorySpy extends AuthenticationSessionRepository {
    public create = jest.fn<Promise<void>, [AuthenticationSession]>();
    public update = jest.fn<Promise<void>, [AuthenticationSession]>();
    public findById = jest.fn<Promise<AuthenticationSession | null>, [string]>();
    public findByRefreshTokenHash = jest.fn<Promise<AuthenticationSession | null>, [string]>();
    public findByAuthenticationAccountId = jest.fn<Promise<AuthenticationSession[]>, [string]>();
}

export class EmailVerificationRepositorySpy extends EmailVerificationRepository {
    public create = jest.fn<Promise<void>, [EmailVerification, TransactionContext?]>();
    public update = jest.fn<Promise<void>, [EmailVerification, TransactionContext?]>();
    public findById = jest.fn<Promise<EmailVerification | null>, [string]>();
    public findByTokenHash = jest.fn<Promise<EmailVerification | null>, [string]>();
    public findPendingByAccount = jest.fn<Promise<EmailVerification[]>, [string]>();
    public invalidatePendingByAccount = jest.fn<Promise<void>, [string, TransactionContext]>();
}
