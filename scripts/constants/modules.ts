export const MODULE_FOLDERS = [
    "application/use-cases",

    "domain/entities",
    "domain/errors",
    "domain/interfaces",
    "domain/types",
    "domain/value-objects",

    "infrastructure/database",
    "infrastructure/mappers",
    "infrastructure/providers",
    "infrastructure/repositories",

    "presentation/controllers",
    "presentation/dto",

    "test-doubles",
    "tests",
    "docs",
];

export const MODULE_TARGETS = { core: "core", modules: "modules" } as const;
export type ModuleTarget = keyof typeof MODULE_TARGETS;
