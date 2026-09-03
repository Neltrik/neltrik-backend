/* eslint-disable no-restricted-syntax */
import "express";

declare module "express" {
    interface Request {
        user?: {
            userId: string;
            tenantId: string;
            roleCode: string;
        };
        account?: {
            emailVerified: boolean;
        };
    }
}
