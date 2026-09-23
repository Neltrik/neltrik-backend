import { SetMetadata } from "@nestjs/common";

export const SKIP_USER_STATE_KEY = "skip_user_state";
export const SkipUserState = () => SetMetadata(SKIP_USER_STATE_KEY, true);
