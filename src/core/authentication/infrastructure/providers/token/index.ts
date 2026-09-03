import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import { env } from "@/config/env";

import { AccessTokenPayload } from "./type";

const ACCESS_TOKEN_EXPIRATION_MS = 15 * 60 * 1000;

@Injectable()
export class TokenProvider {
    private readonly refreshTokenSaltRounds = 10;

    constructor(private readonly jwtService: JwtService) {}

    public async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
        const token: string = await this.jwtService.signAsync({
            sub: payload.userId,
            email: payload.email,
            tenantId: payload.tenantId,
            roleCode: payload.roleCode,
            emailVerified: payload.emailVerified,
        });
        return token;
    }

    public generateRefreshToken(): string {
        return randomUUID();
    }

    public async hashRefreshToken(refreshToken: string): Promise<string> {
        return await bcrypt.hash(refreshToken, this.refreshTokenSaltRounds);
    }

    public async compareRefreshToken(refreshToken: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(refreshToken, hash);
    }

    public calculateRefreshTokenExpiration(): Date {
        const expiresInSeconds = env.JWT_REFRESH_TOKEN_EXPIRES_IN;
        return new Date(Date.now() + expiresInSeconds * 1000);
    }

    public calculateAccessTokenExpiration(): Date {
        return new Date(Date.now() + ACCESS_TOKEN_EXPIRATION_MS);
    }
}
