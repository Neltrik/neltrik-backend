import { SetMetadata } from "@nestjs/common";

export const SKIP_EMAIL_VERIFICATION_KEY = "skip_email_verification";
export const SkipEmailVerification = () => SetMetadata(SKIP_EMAIL_VERIFICATION_KEY, true);
