import { Injectable } from "@nestjs/common";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { env } from "@/config/env";

@Injectable()
export class CsrfTokenProvider {
    private readonly secret = env.CSRF_SECRET;

    public generate(sessionId: string): string {
        const randomValue = randomBytes(32).toString("hex");
        const message = this.buildMessage(sessionId, randomValue);
        const hmac = createHmac("sha256", this.secret).update(message).digest("hex");
        return `${hmac}.${randomValue}`;
    }

    public verify(token: string | undefined, sessionId: string): boolean {
        if (!token) {
            return false;
        }
        const parts = token.split(".");
        if (parts.length !== 2) {
            return false;
        }
        const [hmacFromToken, randomValue] = parts;
        if (!hmacFromToken || !randomValue) {
            return false;
        }
        if (hmacFromToken.length !== 64) {
            return false;
        }
        const message = this.buildMessage(sessionId, randomValue);
        const expectedHmac = createHmac("sha256", this.secret).update(message).digest("hex");
        return timingSafeEqual(Buffer.from(hmacFromToken), Buffer.from(expectedHmac));
    }

    private buildMessage(sessionId: string, randomValue: string): string {
        return `${sessionId.length}!${sessionId}!${randomValue.length}!${randomValue}`;
    }
}
