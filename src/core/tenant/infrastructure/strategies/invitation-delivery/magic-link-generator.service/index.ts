import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";

@Injectable()
export class MagicLinkGeneratorService {
    constructor() {}

    public generate(token: string): string {
        return `${env.MAGIC_LINK_BASE_URL}?token=${token}`;
    }
}
