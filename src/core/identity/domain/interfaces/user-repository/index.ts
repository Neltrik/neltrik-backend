import { type User } from "../../entities";
import { type Email } from "../../value-objects";

export abstract class UserRepository {
    abstract create(user: User): Promise<void>;
    abstract update(user: User): Promise<void>;
    abstract get(id: string): Promise<User | null>;
    abstract list(tenantId: string): Promise<User[]>;
    abstract existsByEmail(email: Email): Promise<boolean>;
    abstract delete(userId: string): Promise<void>;
}
