/* eslint-disable no-restricted-syntax */
import { type UserPayload } from "@/shared/auth";

import "express";
import "multer";

declare module "express" {
    interface Request {
        user?: UserPayload;
        account?: {
            emailVerified: boolean;
        };
    }
}
