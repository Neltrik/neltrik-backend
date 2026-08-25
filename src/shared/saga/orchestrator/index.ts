import { type SagaStep } from "../";

export class SagaOrchestrator {
    public static async execute<TContext>(
        steps: SagaStep<TContext>[],
        initialContext: TContext = {} as TContext,
    ): Promise<TContext> {
        const context = { ...initialContext };
        const executedSteps: SagaStep<TContext>[] = [];
        try {
            for (const step of steps) {
                await step.execute(context);
                executedSteps.push(step);
            }
            return context;
        } catch (error) {
            for (const step of executedSteps.reverse()) {
                if (step.compensate) {
                    await step.compensate(context);
                }
            }
            throw error;
        }
    }
}
