const MODULE_NAME_REGEX = /^[a-z]+(?:-[a-z0-9]+)*$/;

export function isValidModuleName(moduleName: string): boolean {
    return MODULE_NAME_REGEX.test(moduleName);
}
