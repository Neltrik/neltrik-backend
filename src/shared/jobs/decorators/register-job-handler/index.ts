export const JOB_HANDLER_METADATA = Symbol("JOB_HANDLER_METADATA");

export function RegisterJobHandler(): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(JOB_HANDLER_METADATA, true, target);
    };
}
