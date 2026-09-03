import { JwtService } from "@nestjs/jwt";

import { env } from "@/config/env";

import { TokenProvider } from "./index";

jest.mock("@nestjs/jwt", () => ({
    JwtService: jest.fn().mockImplementation(() => ({ signAsync: jest.fn() })),
}));

describe("TokenProvider", () => {
    const makeSut = () => {
        const jwtService = new JwtService();
        const signAsyncMock = jest.spyOn(jwtService, "signAsync");
        const sut = new TokenProvider(jwtService);
        return { sut, jwtService, signAsyncMock };
    };

    describe("generateAccessToken", () => {
        it("should generate an access token", async () => {
            const { sut, signAsyncMock } = makeSut();
            signAsyncMock.mockResolvedValue("access-token");
            const result = await sut.generateAccessToken({
                userId: "user-id",
                email: "john@company.com",
                roleCode: "USER",
                tenantId: "tenant-id",
                emailVerified: false,
            });
            expect(signAsyncMock).toHaveBeenCalledTimes(1);
            expect(signAsyncMock).toHaveBeenCalledWith({
                sub: "user-id",
                email: "john@company.com",
                tenantId: "tenant-id",
                roleCode: "USER",
                emailVerified: false,
            });
            expect(result).toBe("access-token");
        });

        it("should propagate JWT generation errors", async () => {
            const { sut, signAsyncMock } = makeSut();
            signAsyncMock.mockRejectedValue(new Error("JWT generation failed"));
            await expect(
                sut.generateAccessToken({
                    userId: "user-id",
                    email: "john@company.com",
                    roleCode: "USER",
                    tenantId: "tenant-id",
                    emailVerified: false,
                }),
            ).rejects.toThrow("JWT generation failed");
        });
    });

    describe("generateRefreshToken", () => {
        it("should generate a refresh token", () => {
            const { sut } = makeSut();
            const result = sut.generateRefreshToken();
            expect(result).toEqual(expect.any(String));
        });

        it("should generate different refresh tokens", () => {
            const { sut } = makeSut();
            const firstToken = sut.generateRefreshToken();
            const secondToken = sut.generateRefreshToken();
            expect(firstToken).not.toBe(secondToken);
        });
    });

    describe("hashRefreshToken", () => {
        it("should hash a refresh token", async () => {
            const { sut } = makeSut();
            const result = await sut.hashRefreshToken("refresh-token");
            expect(result).toEqual(expect.any(String));
            expect(result).not.toBe("refresh-token");
        });
    });

    describe("compareRefreshToken", () => {
        it("should return true when refresh token matches the hash", async () => {
            const { sut } = makeSut();
            const refreshToken = "refresh-token";
            const hash = await sut.hashRefreshToken(refreshToken);
            const result = await sut.compareRefreshToken(refreshToken, hash);
            expect(result).toBe(true);
        });

        it("should return false when refresh token does not match the hash", async () => {
            const { sut } = makeSut();
            const hash = await sut.hashRefreshToken("refresh-token");
            const result = await sut.compareRefreshToken("another-refresh-token", hash);
            expect(result).toBe(false);
        });
    });

    describe("calculateRefreshTokenExpiration", () => {
        it("should calculate the refresh token expiration date", () => {
            const { sut } = makeSut();
            const before = Date.now();
            const result = sut.calculateRefreshTokenExpiration();
            const after = Date.now();
            const expectedDuration = env.JWT_REFRESH_TOKEN_EXPIRES_IN * 1000;
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBeGreaterThanOrEqual(before + expectedDuration);
            expect(result.getTime()).toBeLessThanOrEqual(after + expectedDuration);
        });
    });

    describe("calculateAccessTokenExpiration", () => {
        it("should calculate the access token expiration date", () => {
            const { sut } = makeSut();
            const before = Date.now();
            const result = sut.calculateAccessTokenExpiration();
            const after = Date.now();
            const expectedDuration = 15 * 60 * 1000;
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBeGreaterThanOrEqual(before + expectedDuration);
            expect(result.getTime()).toBeLessThanOrEqual(after + expectedDuration);
        });
    });
});
