import { FileQuotaExceededError, InvalidQuotaLimitError, InvalidQuotaUsageError } from "../../errors";
import { type FileQuotaProps } from "../../types";
import { FileQuota } from "./index";

const createProps = (): FileQuotaProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_000,
        usedBytes: 2_000,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("FileQuota", () => {
    it("should create a file quota", () => {
        const props = createProps();
        const quota = FileQuota.create(props);
        expect(quota.id).toBe("quota-id");
        expect(quota.tenantId).toBe("tenant-id");
        expect(quota.limitBytes).toBe(10_000);
        expect(quota.usedBytes).toBe(0);
        expect(quota.createdAt).toBe(props.createdAt);
        expect(quota.updatedAt).toBe(props.createdAt);
    });

    it("should restore a file quota", () => {
        const props = createProps();
        const quota = FileQuota.restore(props);
        expect(quota.id).toBe(props.id);
        expect(quota.tenantId).toBe(props.tenantId);
        expect(quota.limitBytes).toBe(props.limitBytes);
        expect(quota.usedBytes).toBe(props.usedBytes);
        expect(quota.createdAt).toBe(props.createdAt);
        expect(quota.updatedAt).toBe(props.updatedAt);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const quota = FileQuota.restore(props);
        expect(quota.id).toBe(props.id);
        expect(quota.tenantId).toBe(props.tenantId);
        expect(quota.limitBytes).toBe(props.limitBytes);
        expect(quota.usedBytes).toBe(props.usedBytes);
        expect(quota.createdAt).toBe(props.createdAt);
        expect(quota.updatedAt).toBe(props.updatedAt);
    });
});

describe("Validations", () => {
    it.each([
        ["zero", 0],
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidQuotaLimitError when limit is %s", (_, limitBytes) => {
        expect(() => FileQuota.create({ ...createProps(), limitBytes })).toThrow(InvalidQuotaLimitError);
    });

    it.each([
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidQuotaUsageError when usage is %s", (_, usedBytes) => {
        expect(() => FileQuota.restore({ ...createProps(), usedBytes })).toThrow(InvalidQuotaUsageError);
    });

    it("should allow zero usage", () => {
        const quota = FileQuota.restore({ ...createProps(), usedBytes: 0 });
        expect(quota.usedBytes).toBe(0);
    });

    it.each([
        ["zero", 0],
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidQuotaUsageError when increment size is %s", (_, size) => {
        const quota = FileQuota.restore(createProps());
        expect(() => quota.increment(size)).toThrow(InvalidQuotaUsageError);
    });

    it.each([
        ["zero", 0],
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidQuotaUsageError when decrement size is %s", (_, size) => {
        const quota = FileQuota.restore(createProps());
        expect(() => quota.decrement(size)).toThrow(InvalidQuotaUsageError);
    });
    it.each([
        ["zero", 0],
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidQuotaLimitError when adjusting limit to %s", (_, limitBytes) => {
        const quota = FileQuota.restore(createProps());
        expect(() => quota.adjustLimit(limitBytes)).toThrow(InvalidQuotaLimitError);
    });
});

describe("Mutations", () => {
    it("should increment usage", () => {
        const quota = FileQuota.restore(createProps());
        quota.increment(1_000);
        expect(quota.usedBytes).toBe(3_000);
    });

    it("should update updatedAt when incrementing usage", () => {
        const quota = FileQuota.restore(createProps());
        const previousUpdatedAt = quota.updatedAt;
        quota.increment(1_000);
        expect(quota.updatedAt).toBeInstanceOf(Date);
        expect(quota.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should increment usage up to the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), usedBytes: 9_000 });
        quota.increment(1_000);
        expect(quota.usedBytes).toBe(10_000);
        expect(quota.getAvailableBytes()).toBe(0);
    });

    it("should throw FileQuotaExceededError when increment exceeds the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), usedBytes: 9_000 });
        expect(() => quota.increment(1_001)).toThrow(FileQuotaExceededError);
    });

    it("should not change usage when increment exceeds the limit", () => {
        const quota = FileQuota.restore({
            ...createProps(),
            usedBytes: 9_000,
        });
        expect(() => quota.increment(1_001)).toThrow(FileQuotaExceededError);
        expect(quota.usedBytes).toBe(9_000);
    });

    it("should decrement usage", () => {
        const quota = FileQuota.restore(createProps());
        quota.decrement(500);
        expect(quota.usedBytes).toBe(1_500);
    });

    it("should update updatedAt when decrementing usage", () => {
        const quota = FileQuota.restore(createProps());
        const previousUpdatedAt = quota.updatedAt;
        quota.decrement(500);
        expect(quota.updatedAt).toBeInstanceOf(Date);
        expect(quota.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should decrement usage down to zero", () => {
        const quota = FileQuota.restore(createProps());
        quota.decrement(2_000);
        expect(quota.usedBytes).toBe(0);
    });

    it("should throw InvalidQuotaUsageError when decrement exceeds current usage", () => {
        const quota = FileQuota.restore(createProps());
        expect(() => quota.decrement(2_001)).toThrow(InvalidQuotaUsageError);
    });

    it("should not change usage when decrement exceeds current usage", () => {
        const quota = FileQuota.restore(createProps());
        expect(() => quota.decrement(2_001)).toThrow(InvalidQuotaUsageError);
        expect(quota.usedBytes).toBe(2_000);
    });

    it("should adjust the limit", () => {
        const quota = FileQuota.restore(createProps());
        quota.adjustLimit(20_000);
        expect(quota.limitBytes).toBe(20_000);
    });

    it("should update updatedAt when adjusting the limit", () => {
        const quota = FileQuota.restore(createProps());
        const previousUpdatedAt = quota.updatedAt;
        quota.adjustLimit(20_000);
        expect(quota.updatedAt).toBeInstanceOf(Date);
        expect(quota.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should allow adjusting the limit below current usage", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 8_000 });
        quota.adjustLimit(5_000);
        expect(quota.limitBytes).toBe(5_000);
        expect(quota.usedBytes).toBe(8_000);
        expect(quota.isOverLimit()).toBe(true);
    });
});

describe("Quota helpers", () => {
    it("should return true when the quota can accommodate the requested size", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 8_000 });
        expect(quota.canAccommodate(2_000)).toBe(true);
    });

    it("should return false when the quota cannot accommodate the requested size", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 8_000 });
        expect(quota.canAccommodate(2_001)).toBe(false);
    });

    it("should return true when usage is exactly at the near-limit threshold", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 8_000 });
        expect(quota.isNearLimit()).toBe(true);
    });

    it("should return false when usage is below the near-limit threshold", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 7_999 });
        expect(quota.isNearLimit()).toBe(false);
    });

    it("should use a custom threshold when checking if the quota is near the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 5_000 });
        expect(quota.isNearLimit(0.5)).toBe(true);
        expect(quota.isNearLimit(0.6)).toBe(false);
    });

    it("should return true when usage is over the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 10_001 });
        expect(quota.isOverLimit()).toBe(true);
    });

    it("should return false when usage is exactly at the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 10_000 });
        expect(quota.isOverLimit()).toBe(false);
    });

    it("should return the available bytes", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 2_000 });
        expect(quota.getAvailableBytes()).toBe(8_000);
    });

    it("should return zero available bytes when usage reaches the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 10_000 });
        expect(quota.getAvailableBytes()).toBe(0);
    });

    it("should return negative available bytes when usage is over the limit", () => {
        const quota = FileQuota.restore({ ...createProps(), limitBytes: 10_000, usedBytes: 12_000 });
        expect(quota.getAvailableBytes()).toBe(-2_000);
    });
});
