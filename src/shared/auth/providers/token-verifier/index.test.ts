jest.mock("@nestjs/jwt", () => ({
    JwtService: class JwtService {
        public readonly verifyAsync = jest.fn();
    },
}));

import { JwtService } from "@nestjs/jwt";

import { TokenVerifier } from "./";

describe("TokenVerifier", () => {
    const makeSut = () => {
        const jwtService = new JwtService();
        const tokenVerifier = new TokenVerifier(jwtService);
        return { tokenVerifier, jwtService };
    };

    it("should return the token payload when verification succeeds", async () => {
        const { tokenVerifier, jwtService } = makeSut();
        const payload = { sub: "user-id", tenantId: "tenant-id", roleCode: "ADMIN" };
        jest.spyOn(jwtService, "verifyAsync").mockResolvedValue(payload);
        await expect(tokenVerifier.verify("access-token")).resolves.toEqual(payload);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith("access-token");
    });

    it("should propagate the error when token verification fails", async () => {
        const { tokenVerifier, jwtService } = makeSut();
        jest.spyOn(jwtService, "verifyAsync").mockRejectedValue(new Error("Invalid token"));
        await expect(tokenVerifier.verify("invalid-token")).rejects.toThrow("Invalid token");
        expect(jwtService.verifyAsync).toHaveBeenCalledWith("invalid-token");
    });
});
