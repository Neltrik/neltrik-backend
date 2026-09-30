import { InvalidAntivirusScanError } from "../../../errors";
import { ANTIVIRUS_SCAN_STATUS } from "../../../types";
import { AntivirusScan } from "./index";

describe("AntivirusScan", () => {
    const engine = "ClamAV";
    const scannedAt = new Date("2026-01-15T10:30:00.000Z");

    it("should create a valid antivirus scan", () => {
        const scan = AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine, scannedAt });
        expect(scan.getStatus()).toBe(ANTIVIRUS_SCAN_STATUS.CLEAN);
        expect(scan.getEngine()).toBe(engine);
        expect(scan.getResult()).toBeNull();
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should create a clean antivirus scan", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.getStatus()).toBe(ANTIVIRUS_SCAN_STATUS.CLEAN);
        expect(scan.getEngine()).toBe(engine);
        expect(scan.getResult()).toBeNull();
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should create an infected antivirus scan", () => {
        const scan = AntivirusScan.infected(engine, "Eicar-Test-Signature", scannedAt);
        expect(scan.getStatus()).toBe(ANTIVIRUS_SCAN_STATUS.INFECTED);
        expect(scan.getEngine()).toBe(engine);
        expect(scan.getResult()).toBe("Eicar-Test-Signature");
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should create an error antivirus scan", () => {
        const scan = AntivirusScan.error(engine, "Scan failed", scannedAt);
        expect(scan.getStatus()).toBe(ANTIVIRUS_SCAN_STATUS.ERROR);
        expect(scan.getEngine()).toBe(engine);
        expect(scan.getResult()).toBe("Scan failed");
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should throw InvalidAntivirusScanError when engine is empty", () => {
        expect(() => AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine: "", scannedAt })).toThrow(
            InvalidAntivirusScanError,
        );
    });

    it("should throw InvalidAntivirusScanError when engine contains only whitespace", () => {
        expect(() => AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine: "   ", scannedAt })).toThrow(
            InvalidAntivirusScanError,
        );
    });

    it("should throw InvalidAntivirusScanError when engine is not a string", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine: 123 as unknown as string, scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when scannedAt is invalid", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine, scannedAt: new Date("invalid") }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when scannedAt is not a Date", () => {
        expect(() =>
            AntivirusScan.create({
                status: ANTIVIRUS_SCAN_STATUS.CLEAN,
                engine,
                scannedAt: "2026-01-15T10:30:00.000Z" as unknown as Date,
            }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should allow null result for a clean scan", () => {
        const scan = AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine, result: null, scannedAt });
        expect(scan.getResult()).toBeNull();
    });

    it("should allow undefined result for a clean scan", () => {
        const scan = AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.CLEAN, engine, scannedAt });
        expect(scan.getResult()).toBeNull();
    });

    it("should throw InvalidAntivirusScanError when infected scan has no result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.INFECTED, engine, result: null, scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when infected scan has an empty result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.INFECTED, engine, result: "", scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when infected scan has a whitespace result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.INFECTED, engine, result: "   ", scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when error scan has no result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.ERROR, engine, result: null, scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when error scan has an empty result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.ERROR, engine, result: "", scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should throw InvalidAntivirusScanError when error scan has a whitespace result", () => {
        expect(() =>
            AntivirusScan.create({ status: ANTIVIRUS_SCAN_STATUS.ERROR, engine, result: "   ", scannedAt }),
        ).toThrow(InvalidAntivirusScanError);
    });

    it("should return the scan status", () => {
        const scan = AntivirusScan.infected(engine, "Malware detected", scannedAt);
        expect(scan.getStatus()).toBe(ANTIVIRUS_SCAN_STATUS.INFECTED);
    });

    it("should return the scan engine", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.getEngine()).toBe(engine);
    });

    it("should return the scan result", () => {
        const scan = AntivirusScan.infected(engine, "Malware detected", scannedAt);
        expect(scan.getResult()).toBe("Malware detected");
    });

    it("should return null as result for a clean scan", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.getResult()).toBeNull();
    });

    it("should return the scanned date", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should return a cloned scanned date", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        const result = scan.getScannedAt();
        expect(result).toEqual(scannedAt);
        expect(result).not.toBe(scannedAt);
    });

    it("should not mutate the scanned date when the original date is modified", () => {
        const originalDate = new Date("2026-01-15T10:30:00.000Z");
        const scan = AntivirusScan.clean(engine, originalDate);
        originalDate.setFullYear(2030);
        expect(scan.getScannedAt()).toEqual(new Date("2026-01-15T10:30:00.000Z"));
    });

    it("should not mutate the scanned date when the returned date is modified", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        const result = scan.getScannedAt();
        result.setFullYear(2030);
        expect(scan.getScannedAt()).toEqual(scannedAt);
    });

    it("should return true when the scan is clean", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.isClean()).toBe(true);
    });

    it("should return false when the scan is not clean", () => {
        const scan = AntivirusScan.infected(engine, "Malware detected", scannedAt);
        expect(scan.isClean()).toBe(false);
    });

    it("should return true when the scan is infected", () => {
        const scan = AntivirusScan.infected(engine, "Malware detected", scannedAt);
        expect(scan.isInfected()).toBe(true);
    });

    it("should return false when the scan is not infected", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.isInfected()).toBe(false);
    });

    it("should return true when the scan has an error", () => {
        const scan = AntivirusScan.error(engine, "Scan failed", scannedAt);
        expect(scan.hasError()).toBe(true);
    });

    it("should return false when the scan does not have an error", () => {
        const scan = AntivirusScan.clean(engine, scannedAt);
        expect(scan.hasError()).toBe(false);
    });

    it("should return true when two antivirus scans are equal", () => {
        const scan1 = AntivirusScan.create({
            status: ANTIVIRUS_SCAN_STATUS.INFECTED,
            engine,
            result: "Malware detected",
            scannedAt,
        });
        const scan2 = AntivirusScan.create({
            status: ANTIVIRUS_SCAN_STATUS.INFECTED,
            engine,
            result: "Malware detected",
            scannedAt: new Date(scannedAt.getTime()),
        });
        expect(scan1.equals(scan2)).toBe(true);
    });

    it("should return false when two antivirus scans have different statuses", () => {
        const scan1 = AntivirusScan.clean(engine, scannedAt);
        const scan2 = AntivirusScan.error(engine, "Scan failed", scannedAt);
        expect(scan1.equals(scan2)).toBe(false);
    });

    it("should return false when two antivirus scans have different engines", () => {
        const scan1 = AntivirusScan.clean("ClamAV", scannedAt);
        const scan2 = AntivirusScan.clean("Windows Defender", scannedAt);
        expect(scan1.equals(scan2)).toBe(false);
    });

    it("should return false when two antivirus scans have different results", () => {
        const scan1 = AntivirusScan.infected(engine, "Malware A", scannedAt);
        const scan2 = AntivirusScan.infected(engine, "Malware B", scannedAt);
        expect(scan1.equals(scan2)).toBe(false);
    });

    it("should return false when two antivirus scans have different scanned dates", () => {
        const scan1 = AntivirusScan.clean(engine, scannedAt);
        const scan2 = AntivirusScan.clean(engine, new Date("2026-01-15T11:30:00.000Z"));
        expect(scan1.equals(scan2)).toBe(false);
    });
});
