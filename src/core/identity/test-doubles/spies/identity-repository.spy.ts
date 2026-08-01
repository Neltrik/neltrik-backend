import { type User } from "../../domain/entities";
import { UserRepository } from "../../domain/interfaces";
import { type Email } from "../../domain/value-objects";

export class UserRepositorySpy extends UserRepository {
    public create = jest.fn<Promise<void>, [User]>();
    public existsByEmail = jest.fn<Promise<boolean>, [Email]>();
}
