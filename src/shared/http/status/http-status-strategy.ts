export abstract class HttpStatusStrategy {
    public abstract supports(exception: unknown): boolean;
    public abstract resolve(exception: unknown): number;
}
