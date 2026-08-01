import { type User } from "../../entities";
import { type Email } from "../../value-objects";

export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
    public abstract existsByEmail(email: Email): Promise<boolean>;
}
