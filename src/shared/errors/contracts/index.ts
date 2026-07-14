export interface ErrorDetail {
    code: string;
    message: string;
    field?: string;
    metadata?: Record<string, unknown>;
}
