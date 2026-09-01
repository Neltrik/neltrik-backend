import { Injectable } from "@nestjs/common";

import { InvitationDeliveryResult, SyncInvitationDeliveryStrategy } from "../contracts";
import { MagicLinkGeneratorService } from "../magic-link-generator.service";

@Injectable()
export class ManualStrategy extends SyncInvitationDeliveryStrategy {
    constructor(private readonly magicLinkGenerator: MagicLinkGeneratorService) {
        super();
    }

    public deliver(token: string): InvitationDeliveryResult {
        const magicLink = this.magicLinkGenerator.generate(token);
        return { magicLink };
    }
}
