import type { Request } from "express";

import { CookieHelper } from "./";

describe("CookieHelper", () => {
    const makeSut = () => {
        const req = Object.create(null) as Request;
        req.cookies = {};
        return { req };
    };

    it("should return undefined when cookies is null", () => {
        const { req } = makeSut();
        req.cookies = null as never;
        expect(CookieHelper.get(req, "accessToken")).toBeUndefined();
    });

    it("should return undefined when cookies is not an object", () => {
        const { req } = makeSut();
        req.cookies = "invalid-cookies" as never;
        expect(CookieHelper.get(req, "accessToken")).toBeUndefined();
    });

    it("should return the cookie value when the cookie exists", () => {
        const { req } = makeSut();
        req.cookies.accessToken = "access-token";
        expect(CookieHelper.get(req, "accessToken")).toBe("access-token");
    });

    it("should return undefined when the cookie does not exist", () => {
        const { req } = makeSut();
        req.cookies.accessToken = "access-token";
        expect(CookieHelper.get(req, "refreshToken")).toBeUndefined();
    });

    it("should return undefined when the cookie value is undefined", () => {
        const { req } = makeSut();
        req.cookies.accessToken = undefined;
        expect(CookieHelper.get(req, "accessToken")).toBeUndefined();
    });

    it("should return an empty string when the cookie value is an empty string", () => {
        const { req } = makeSut();
        req.cookies.accessToken = "";
        expect(CookieHelper.get(req, "accessToken")).toBe("");
    });

    it("should return the requested cookie when multiple cookies exist", () => {
        const { req } = makeSut();
        req.cookies.accessToken = "access-token";
        req.cookies.refreshToken = "refresh-token";
        expect(CookieHelper.get(req, "refreshToken")).toBe("refresh-token");
    });

    it("should return undefined when the cookie value is not a string", () => {
        const { req } = makeSut();
        req.cookies.accessToken = 123;
        expect(CookieHelper.get(req, "accessToken")).toBeUndefined();
    });
});
