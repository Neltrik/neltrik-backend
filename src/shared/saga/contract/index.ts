export interface SagaStep<TContext = Record<string, unknown>> {
    execute(context: TContext): Promise<void>;
    compensate?(context: TContext): Promise<void>;
}
