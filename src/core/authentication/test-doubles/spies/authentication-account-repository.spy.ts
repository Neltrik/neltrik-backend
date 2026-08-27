import type { AuthenticationAccount, AuthenticationSession } from "../../domain/entities";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../domain/interfaces";

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
