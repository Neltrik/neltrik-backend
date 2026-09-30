import { InvalidAntivirusScanError } from "../../../errors";
import { ANTIVIRUS_SCAN_STATUS, type AntivirusScanStatus } from "../../../types";

export class AntivirusScan {
    private constructor(
        private readonly status: AntivirusScanStatus,
        private readonly engine: string,
        private readonly result: string | null,
        private readonly scannedAt: Date,
    ) {}

    public static create(params: {
        status: AntivirusScanStatus;
        engine: string;
        result?: string | null;
        scannedAt: Date;
    }): AntivirusScan {
        AntivirusScan.ensureEngine(params.engine);
        AntivirusScan.ensureScannedAt(params.scannedAt);
        AntivirusScan.ensureResultForStatus(params.status, params.result ?? null);
        return new AntivirusScan(
            params.status,
            params.engine,
            params.result ?? null,
            new Date(params.scannedAt.getTime()),
        );
    }

    public static clean(engine: string, scannedAt: Date): AntivirusScan {
        return AntivirusScan.create({
            status: ANTIVIRUS_SCAN_STATUS.CLEAN,
            engine,
            result: null,
            scannedAt,
        });
    }

    public static infected(engine: string, result: string, scannedAt: Date): AntivirusScan {
        return AntivirusScan.create({
            status: ANTIVIRUS_SCAN_STATUS.INFECTED,
            engine,
            result,
            scannedAt,
        });
    }

    public static error(engine: string, result: string, scannedAt: Date): AntivirusScan {
        return AntivirusScan.create({
            status: ANTIVIRUS_SCAN_STATUS.ERROR,
            engine,
            result,
            scannedAt,
        });
    }

    private static ensureEngine(engine: string): void {
        if (typeof engine !== "string" || engine.trim().length === 0) {
            throw new InvalidAntivirusScanError();
        }
    }

    private static ensureScannedAt(scannedAt: Date): void {
        if (!(scannedAt instanceof Date) || isNaN(scannedAt.getTime())) {
            throw new InvalidAntivirusScanError();
        }
    }

    private static ensureResultForStatus(status: AntivirusScanStatus, result: string | null): void {
        if (status === ANTIVIRUS_SCAN_STATUS.CLEAN) {
            return;
        }
        if (result === null || result.trim().length === 0) {
            throw new InvalidAntivirusScanError();
        }
    }

    public getStatus(): AntivirusScanStatus {
        return this.status;
    }

    public getEngine(): string {
        return this.engine;
    }

    public getResult(): string | null {
        return this.result;
    }

    public getScannedAt(): Date {
        return new Date(this.scannedAt.getTime());
    }

    public isClean(): boolean {
        return this.status === ANTIVIRUS_SCAN_STATUS.CLEAN;
    }

    public isInfected(): boolean {
        return this.status === ANTIVIRUS_SCAN_STATUS.INFECTED;
    }

    public hasError(): boolean {
        return this.status === ANTIVIRUS_SCAN_STATUS.ERROR;
    }

    public equals(other: AntivirusScan): boolean {
        return (
            this.status === other.status &&
            this.engine === other.engine &&
            this.result === other.result &&
            this.scannedAt.getTime() === other.scannedAt.getTime()
        );
    }
}
