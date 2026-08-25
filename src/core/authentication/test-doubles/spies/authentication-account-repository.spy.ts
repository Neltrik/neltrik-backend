import { type AuthenticationAccount } from "../../domain/entities";
import { AuthenticationAccountRepository } from "../../domain/interfaces";

export class AuthenticationAccountRepositorySpy extends AuthenticationAccountRepository {
    public create = jest.fn<Promise<void>, [AuthenticationAccount]>();
    public findByUserId = jest.fn<Promise<AuthenticationAccount | null>, [string]>();
    public findByEmail = jest.fn<Promise<AuthenticationAccount | null>, [string]>();
    public update = jest.fn<Promise<void>, [AuthenticationAccount]>();
    public delete = jest.fn<Promise<void>, [string]>();
}
