import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface TokenPayload {
    sub: string;
    tenantId: string;
    roleCode: string;
    emailVerified: boolean;
}

@Injectable()
export class TokenVerifier {
    constructor(private readonly jwtService: JwtService) {}

    public async verify(token: string): Promise<TokenPayload> {
        return await this.jwtService.verifyAsync<TokenPayload>(token);
    }
}
