import { UnsupportedDeliveryMechanismError } from "../../../../domain/errors/invitation";
import { MagicLinkGeneratorService } from "../magic-link-generator.service";
import { ManualStrategy } from "../manual";
import { InvitationDeliveryStrategyFactory } from "./index";

describe("InvitationDeliveryStrategyFactory", () => {
    const makeSut = () => {
        const magicLinkGenerator = new MagicLinkGeneratorService();
        const manualStrategy = new ManualStrategy(magicLinkGenerator);
        const factory = new InvitationDeliveryStrategyFactory(manualStrategy);
        return { factory, manualStrategy };
    };

    it("should return the manual strategy for manual mechanism", () => {
        const { factory, manualStrategy } = makeSut();
        const result = factory.create("manual");
        expect(result).toBe(manualStrategy);
    });

    it("should throw UnsupportedDeliveryMechanismError for unsupported mechanism", () => {
        const { factory } = makeSut();
        expect(() => factory.create("email")).toThrow(UnsupportedDeliveryMechanismError);
    });

    it("should throw UnsupportedDeliveryMechanismError for empty mechanism", () => {
        const { factory } = makeSut();
        expect(() => factory.create("")).toThrow(UnsupportedDeliveryMechanismError);
    });
});
