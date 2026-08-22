import { env } from "@/config/index";

import { MagicLinkGeneratorService } from "./";

describe("MagicLinkGeneratorService", () => {
    const makeSut = () => {
        const service = new MagicLinkGeneratorService();
        return { service };
    };

    it("should generate a magic link with the invitation token", () => {
        const { service } = makeSut();
        const token = "invitation-token";
        const result = service.generate(token);
        expect(result).toBe(`${env.MAGIC_LINK_BASE_URL}?token=${token}`);
    });

    it("should preserve the token in the generated magic link", () => {
        const { service } = makeSut();
        const token = "123e4567-e89b-12d3-a456-426614174000";
        const result = service.generate(token);
        expect(result).toContain(`token=${token}`);
    });
});
