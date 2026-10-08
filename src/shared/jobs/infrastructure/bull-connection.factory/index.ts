import { Redis } from "ioredis";

import { env } from "@/config/index";

export const BULL_CONNECTION = Symbol("BULL_CONNECTION");

export function createBullConnection(): Redis {
    return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
}
