import { Injectable } from "@nestjs/common";

import { TemplateRenderer } from "../../interfaces";
import type { NotificationPayload } from "../../types";

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

@Injectable()
export class StringInterpolationRenderer extends TemplateRenderer {
    public render(template: string, payload: NotificationPayload): string {
        return template.replace(PLACEHOLDER_REGEX, (match, key: string) => {
            const value = payload[key];
            if (!isPrimitive(value)) {
                return match;
            }
            return String(value);
        });
    }
}
