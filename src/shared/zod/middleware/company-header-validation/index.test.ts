import { BadRequestException } from "@nestjs/common";
import { type NextFunction, type Request, type Response } from "express";

import { CompanyHeaderValidationMiddleware } from "./";

describe("CompanyHeaderValidationMiddleware", () => {
    const makeSut = () => new CompanyHeaderValidationMiddleware();
    const makeRequest = (companyId?: string) => ({ headers: { "x-company-id": companyId } }) as unknown as Request;
    const makeResponse = () => ({}) as Response;
    const makeNext = () => jest.fn() as jest.MockedFunction<NextFunction>;
    it("should call next when company header contains a valid UUID", () => {
        const sut = makeSut();
        const req = makeRequest("123e4567-e89b-12d3-a456-426614174000");
        const res = makeResponse();
        const next = makeNext();
        sut.use(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    it("should call next with BadRequestException when company header contains an invalid UUID", () => {
        const sut = makeSut();
        const req = makeRequest("invalid-id");
        const res = makeResponse();
        const next = makeNext();
        sut.use(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it("should call next when company header is missing", () => {
        const sut = makeSut();
        const req = makeRequest();
        const res = makeResponse();
        const next = makeNext();
        sut.use(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });
});
