import { MagicLinkGeneratorService } from "../magic-link-generator.service";
import { ManualStrategy } from "./index";

describe("ManualStrategy", () => {
    const makeSut = () => {
        const magicLinkGenerator = new MagicLinkGeneratorService();
        const strategy = new ManualStrategy(magicLinkGenerator);
        return { strategy, magicLinkGenerator };
    };

    it("should generate a magic link for the invitation token", () => {
        const { strategy, magicLinkGenerator } = makeSut();
        const token = "invitation-token";
        const result = strategy.deliver(token);
        expect(result).toEqual({ magicLink: magicLinkGenerator.generate(token) });
    });
});
