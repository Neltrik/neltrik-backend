import { dedent } from "../utils/dedent.utils";

export const CliMessages = {
    creating: (moduleName: string): string => dedent(`📦 Creando módulo "${moduleName}"...`),
    emptyName: () => `❌ Debes indicar el nombre del módulo.`,
    emptyTarget: (): string =>
        dedent(`
        ❌ Debes indicar el destino del módulo.
        Uso:
        pnpm module:create auth --target=*
        pnpm module:create ats --target=*
    `),
    alreadyExists: (moduleName: string, modulePath: string): string =>
        `❌ El módulo "${moduleName}" ya existe.\n${modulePath}`,
    invalidName: (): string =>
        dedent(`
            ❌ Nombre de módulo inválido.
            Utiliza únicamente:

            • letras minúsculas
            • números
            • guiones (-)

            Ejemplos válidos:

            ✓ auth
            ✓ ats
            ✓ candidate-profile
            ✓ candidate-profile-v2
    `),
    invalidTarget: (targets: string[]): string => {
        const supportedTargets = targets.map((target) => `• ${target}`).join("\n");
        return ["❌ Destino de módulo inválido.", "Destinos soportados:", "", supportedTargets].join("\n");
    },
    success: (moduleName: string): string => `🎉 Módulo "${moduleName}" creado correctamente.`,
};
