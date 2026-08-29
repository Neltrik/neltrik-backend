import type { Config } from "jest";

const config: Config = {
    coverageProvider: "v8",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "js", "json"],
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules/", "/src/config/"],
    clearMocks: true,
    setupFiles: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/config/(.*)$": "<rootDir>/src/config/$1",
        "^@/core/(.*)$": "<rootDir>/src/core/$1",
        "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;
