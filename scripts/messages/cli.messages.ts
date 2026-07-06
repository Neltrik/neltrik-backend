import { dedent } from "../utils/dedent.utils";

export const CliMessages = {
    creating: (moduleName: string): string => dedent(`📦 Creando módulo "${moduleName}"...`),
    emptyName: () => `❌ Debes indicar el nombre del módulo.`,
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
    success: (moduleName: string): string => `🎉 Módulo "${moduleName}" creado correctamente.`,
};
