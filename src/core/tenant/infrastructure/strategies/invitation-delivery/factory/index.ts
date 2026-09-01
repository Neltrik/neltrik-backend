import { Injectable } from "@nestjs/common";

import { UnsupportedDeliveryMechanismError } from "../../../../domain/errors/invitation";
import { InvitationDeliveryStrategy } from "../contracts";
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
