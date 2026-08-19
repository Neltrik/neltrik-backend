import type { Password } from "../../value-objects";
import type { PasswordHash } from "../../value-objects";

export abstract class PasswordHasher {
    abstract hash(password: Password): Promise<PasswordHash>;
    abstract compare(password: Password, passwordHash: PasswordHash): Promise<boolean>;
}
