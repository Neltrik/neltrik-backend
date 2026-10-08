import { JOB_HANDLER_METADATA, RegisterJobHandler } from "./";

import "reflect-metadata";

describe("RegisterJobHandler", () => {
    it("should define the job handler metadata", () => {
        @RegisterJobHandler()
        class TestJobHandler {}
        expect(Reflect.getMetadata(JOB_HANDLER_METADATA, TestJobHandler)).toBe(true);
    });
});
