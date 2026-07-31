import { type User } from "../../entities";

export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
}
