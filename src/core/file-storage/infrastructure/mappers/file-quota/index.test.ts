import type { FileQuota as PrismaFileQuota } from "@prisma/client";

import { FileQuota } from "../../../domain/entities";
import { type FileQuotaProps } from "../../../domain/types";
import { FileQuotaMapper } from "./index";

const createProps = (): FileQuotaProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return { id: "quota-id", tenantId: "tenant-id", limitBytes: 10_000, usedBytes: 2_000, createdAt, updatedAt };
};

describe("FileQuotaMapper", () => {
    it("should map a domain file quota to persistence", () => {
        const quota = FileQuota.restore(createProps());
        const persistence = FileQuotaMapper.toPersistence(quota);
        expect(persistence).toEqual({
            id: quota.id,
            tenantId: quota.tenantId,
            limitBytes: BigInt(quota.limitBytes),
            usedBytes: BigInt(quota.usedBytes),
            createdAt: quota.createdAt,
            updatedAt: quota.updatedAt,
        });
    });

    it("should map quota numbers to bigint when mapping to persistence", () => {
        const quota = FileQuota.restore(createProps());
        const persistence = FileQuotaMapper.toPersistence(quota);
        expect(typeof persistence.limitBytes).toBe("bigint");
        expect(typeof persistence.usedBytes).toBe("bigint");
        expect(persistence.limitBytes).toBe(10_000n);
        expect(persistence.usedBytes).toBe(2_000n);
    });

    it("should preserve dates when mapping a domain file quota to persistence", () => {
        const props = createProps();
        const quota = FileQuota.restore(props);
        const persistence = FileQuotaMapper.toPersistence(quota);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence file quota to domain", () => {
        const props = createProps();
        const persistence = {
            id: props.id,
            tenantId: props.tenantId,
            limitBytes: BigInt(props.limitBytes),
            usedBytes: BigInt(props.usedBytes),
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
        const quota = FileQuotaMapper.toDomain(persistence);
        expect(quota).toBeInstanceOf(FileQuota);
        expect(quota.id).toBe(persistence.id);
        expect(quota.tenantId).toBe(persistence.tenantId);
        expect(quota.limitBytes).toBe(10_000);
        expect(quota.usedBytes).toBe(2_000);
        expect(quota.createdAt).toEqual(persistence.createdAt);
        expect(quota.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map persistence bigint values to numbers when mapping to domain", () => {
        const persistence = { ...createProps(), limitBytes: 50_000, usedBytes: 12_500 } as unknown as PrismaFileQuota;
        const quota = FileQuotaMapper.toDomain(persistence);
        expect(typeof quota.limitBytes).toBe("number");
        expect(typeof quota.usedBytes).toBe("number");
        expect(quota.limitBytes).toBe(50_000);
        expect(quota.usedBytes).toBe(12_500);
    });

    it("should preserve dates when mapping a persistence file quota to domain", () => {
        const props = createProps();
        const persistence = {
            ...props,
            limitBytes: props.limitBytes,
            usedBytes: props.usedBytes,
        } as unknown as PrismaFileQuota;
        const quota = FileQuotaMapper.toDomain(persistence);
        expect(quota.createdAt).toEqual(props.createdAt);
        expect(quota.updatedAt).toEqual(props.updatedAt);
    });

    it("should map a quota with zero usage from persistence to domain", () => {
        const persistence = { ...createProps(), limitBytes: 10_000, usedBytes: 0 } as unknown as PrismaFileQuota;
        const quota = FileQuotaMapper.toDomain(persistence);
        expect(quota.limitBytes).toBe(10_000);
        expect(quota.usedBytes).toBe(0);
    });
});
