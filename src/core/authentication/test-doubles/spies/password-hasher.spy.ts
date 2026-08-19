import { PasswordHasher } from "../../domain/interfaces";
import type { Password, PasswordHash } from "../../domain/value-objects";

export class PasswordHasherSpy extends PasswordHasher {
    public hash = jest.fn<Promise<PasswordHash>, [Password]>();
    public compare = jest.fn<Promise<boolean>, [Password, PasswordHash]>();
}
