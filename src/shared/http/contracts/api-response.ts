export interface ApiResponse<T> {
    data: T | null;
    code: string;
    message: string;
    details: unknown[];
    meta: Record<string, unknown>;
}
