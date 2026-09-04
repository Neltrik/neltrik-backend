import type { TransactionContext } from "@/shared/transaction";

import type {
    AuthenticationAccount,
    AuthenticationSession,
    EmailVerification,
    PasswordReset,
} from "../../domain/entities";
import {
    AuthenticationAccountRepository,
    AuthenticationSessionRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
} from "../../domain/interfaces";

export class PasswordResetRepositorySpy extends PasswordResetRepository {
    public create = jest.fn<Promise<void>, [PasswordReset]>();
    public update = jest.fn<Promise<void>, [PasswordReset]>();
    public findByTokenHash = jest.fn<Promise<PasswordReset | null>, [string]>();
}

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
    public invalidateByAccount = jest.fn<Promise<void>, [string, TransactionContext]>();
}

export class EmailVerificationRepositorySpy extends EmailVerificationRepository {
    public create = jest.fn<Promise<void>, [EmailVerification, TransactionContext?]>();
    public update = jest.fn<Promise<void>, [EmailVerification, TransactionContext?]>();
    public findById = jest.fn<Promise<EmailVerification | null>, [string]>();
    public findByTokenHash = jest.fn<Promise<EmailVerification | null>, [string]>();
    public findPendingByAccount = jest.fn<Promise<EmailVerification[]>, [string]>();
    public invalidatePendingByAccount = jest.fn<Promise<void>, [string, TransactionContext]>();
}
