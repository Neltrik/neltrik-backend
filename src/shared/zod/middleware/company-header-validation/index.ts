import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { ZodValidationPipe } from "../../pipes";

const companyHeaderSchema = z.uuid();
const validator = new ZodValidationPipe(companyHeaderSchema);

@Injectable()
export class CompanyHeaderValidationMiddleware implements NestMiddleware {
    public use(req: Request, _res: Response, next: NextFunction): void {
        const headerCompanyId = req.headers["x-company-id"];
        if (headerCompanyId !== undefined) {
            try {
                validator.transform(headerCompanyId, { type: "param", metatype: String, data: "x-company-id" });
            } catch (error) {
                next(error);
                return;
            }
        }
        next();
    }
}
