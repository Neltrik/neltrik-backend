export class DomainStatusRegistry {
    private static readonly config = new Map<string, number>();

    public static register(code: string, status: number): void {
        this.config.set(code, status);
    }

    public static getStatus(code: string): number | undefined {
        return this.config.get(code);
    }
}
