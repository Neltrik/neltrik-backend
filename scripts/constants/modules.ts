export const MODULE_FOLDERS = [
    "application/use-cases",
    "application/application-services",

    "domain/entities",
    "domain/errors",
    "domain/interfaces",
    "domain/types",
    "domain/value-objects",

    "infrastructure/mappers",
    "infrastructure/providers",
    "infrastructure/repositories",

    "presentation/controllers",
    "presentation/dto",
    "presentation/messages",
    "presentation/schemas",

    "test-doubles",
    "tests",
    "docs",
];
export const MODULE_FILES = ["application/index.ts"];

export const MODULE_TARGETS = { core: "core", modules: "modules" } as const;
export type ModuleTarget = keyof typeof MODULE_TARGETS;
