import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class PasswordHasher {
    private readonly saltRounds = 10;

    public async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    public async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
