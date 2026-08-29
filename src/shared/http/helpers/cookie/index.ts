import { type Request } from "express";

function isRecordOfString(value: unknown): value is Record<string, string | undefined> {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    return true;
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

export class CookieHelper {
    public static get(req: Request, name: string): string | undefined {
        if (!isRecordOfString(req.cookies)) {
            return undefined;
        }
        const cookie = req.cookies[name];
        if (!isString(cookie)) {
            return undefined;
        }
        return cookie;
    }
}
