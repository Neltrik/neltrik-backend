import { Injectable } from "@nestjs/common";

import { InvitationDeliveryStrategy } from "../../../../application/strategies/invitation-delivery";
import { UnsupportedDeliveryMechanismError } from "../../../../domain/errors/invitation";
import { ManualStrategy } from "../manual";

@Injectable()
export class InvitationDeliveryStrategyFactory {
    constructor(private readonly manualStrategy: ManualStrategy) {}

    public create(mechanism: string): InvitationDeliveryStrategy {
        switch (mechanism) {
            case "manual":
                return this.manualStrategy;
            default:
                throw new UnsupportedDeliveryMechanismError();
        }
    }
}
