import { ResponseBuilder } from "./";

describe("ResponseBuilder", () => {
    it("should build a response successfully", () => {
        const response = ResponseBuilder.build({ id: "1" }, "SUCCESS", "Success", ["detail-1", "detail-2"], {
            page: 1,
        });
        expect(response).toEqual({
            data: { id: "1" },
            code: "SUCCESS",
            message: "Success",
            details: ["detail-1", "detail-2"],
            meta: { page: 1 },
        });
    });

    it("should return an empty details array when details contains one element", () => {
        const response = ResponseBuilder.build(null, "SUCCESS", "Success", ["detail"]);
        expect(response.details).toEqual([]);
    });
});
