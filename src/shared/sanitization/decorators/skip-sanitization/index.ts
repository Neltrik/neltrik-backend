import { SetMetadata } from "@nestjs/common";

export const SKIP_SANITIZATION_KEY = "skip_sanitization";
export const SkipSanitization = () => SetMetadata(SKIP_SANITIZATION_KEY, true);
