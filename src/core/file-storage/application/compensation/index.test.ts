import { Logger } from "@nestjs/common";

import { CompensatingOperationService } from "./index";

describe("CompensatingOperationService", () => {
    const makeSut = () => {
        const service = new CompensatingOperationService();
        return { service };
    };

    it("should return the local work result when all operations succeed", async () => {
        const { service } = makeSut();
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const localWork = jest.fn<Promise<string>, []>().mockResolvedValue("success");
        const result = await service.execute(externalOperation, compensatingOperation, localWork);
        expect(result).toBe("success");
        expect(externalOperation).toHaveBeenCalledTimes(1);
        expect(localWork).toHaveBeenCalledTimes(1);
        expect(compensatingOperation).not.toHaveBeenCalled();
    });

    it("should execute the external operation before local work", async () => {
        const { service } = makeSut();
        const calls: string[] = [];
        const externalOperation = jest.fn<Promise<void>, []>().mockImplementation(() => {
            calls.push("external");
            return Promise.resolve();
        });
        const localWork = jest.fn<Promise<string>, []>().mockImplementation(() => {
            calls.push("local");
            return Promise.resolve("success");
        });
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        await service.execute(externalOperation, compensatingOperation, localWork);
        expect(calls).toEqual(["external", "local"]);
        expect(compensatingOperation).not.toHaveBeenCalled();
    });

    it("should compensate when local work fails", async () => {
        const { service } = makeSut();
        const error = new Error("Local work failed");
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const localWork = jest.fn<Promise<string>, []>().mockRejectedValue(error);
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).rejects.toBe(error);
        expect(externalOperation).toHaveBeenCalledTimes(1);
        expect(localWork).toHaveBeenCalledTimes(1);
        expect(compensatingOperation).toHaveBeenCalledTimes(1);
    });

    it("should rethrow the original local work error after successful compensation", async () => {
        const { service } = makeSut();
        const originalError = new Error("Local work failed");
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const localWork = jest.fn<Promise<string>, []>().mockRejectedValue(originalError);
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).rejects.toBe(originalError);
        expect(compensatingOperation).toHaveBeenCalledTimes(1);
    });

    it("should rethrow the original error when compensation fails", async () => {
        const { service } = makeSut();
        const originalError = new Error("Local work failed");
        const compensationError = new Error("Compensation failed");
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockRejectedValue(compensationError);
        const localWork = jest.fn<Promise<string>, []>().mockRejectedValue(originalError);
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).rejects.toBe(originalError);
        expect(externalOperation).toHaveBeenCalledTimes(1);
        expect(localWork).toHaveBeenCalledTimes(1);
        expect(compensatingOperation).toHaveBeenCalledTimes(1);
    });

    it("should not execute local work or compensation when external operation fails", async () => {
        const { service } = makeSut();
        const externalError = new Error("External operation failed");
        const externalOperation = jest.fn<Promise<void>, []>().mockRejectedValue(externalError);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const localWork = jest.fn<Promise<string>, []>().mockResolvedValue("success");
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).rejects.toBe(externalError);
        expect(externalOperation).toHaveBeenCalledTimes(1);
        expect(localWork).not.toHaveBeenCalled();
        expect(compensatingOperation).not.toHaveBeenCalled();
    });

    it("should preserve the local work result when it returns a non-void value", async () => {
        const { service } = makeSut();
        const result = { id: "result-id", value: 123 };
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const localWork = jest.fn<Promise<typeof result>, []>().mockResolvedValue(result);
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).resolves.toBe(result);
        expect(compensatingOperation).not.toHaveBeenCalled();
    });

    it("should log the compensation error when compensation fails", async () => {
        const { service } = makeSut();
        const originalError = new Error("Local work failed");
        const compensationError = new Error("Compensation failed");
        const loggerErrorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const externalOperation = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        const compensatingOperation = jest.fn<Promise<void>, []>().mockRejectedValue(compensationError);
        const localWork = jest.fn<Promise<string>, []>().mockRejectedValue(originalError);
        await expect(service.execute(externalOperation, compensatingOperation, localWork)).rejects.toBe(originalError);
        expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Compensation failed. The external operation was not reverted. " +
                "This will be handled by the reconciliation job.",
            { originalError, compensationError },
        );
        loggerErrorSpy.mockRestore();
    });
});
