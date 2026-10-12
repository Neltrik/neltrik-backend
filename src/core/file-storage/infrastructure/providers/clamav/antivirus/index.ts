import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";

import { AntivirusPort } from "../../../../domain/interfaces";
import { AntivirusScan } from "../../../../domain/value-objects";
import { ClamavClient } from "../client";

const ENGINE = "clamav";

@Injectable()
export class ClamavAntivirusAdapter extends AntivirusPort {
    private readonly client: ClamavClient;

    constructor() {
        super();
        this.client = new ClamavClient(env.CLAMAV_HOST, env.CLAMAV_PORT, env.CLAMAV_TIMEOUT_MS);
    }

    public async scan(buffer: Buffer): Promise<AntivirusScan> {
        const now = new Date();
        try {
            const reply = await this.client.scanBuffer(buffer);
            return this.parseReply(reply, now);
        } catch (error) {
            return AntivirusScan.error(ENGINE, this.describeError(error), now);
        }
    }

    private parseReply(reply: string, now: Date): AntivirusScan {
        const trimmed = reply.trim();
        if (trimmed.includes("FOUND")) {
            const match = trimmed.match(/stream:\s*(.+?)\s*FOUND/);
            const virusName = match?.[1] ?? "unknown";
            return AntivirusScan.infected(ENGINE, virusName, now);
        }
        if (trimmed.includes("ERROR")) {
            return AntivirusScan.error(ENGINE, trimmed, now);
        }
        if (trimmed.includes("OK")) {
            return AntivirusScan.clean(ENGINE, now);
        }
        return AntivirusScan.error(ENGINE, `unexpected reply: ${trimmed}`, now);
    }

    private describeError(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return "unknown error";
    }
}
