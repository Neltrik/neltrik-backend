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
    clearMocks: true,
    moduleNameMapper: {
        "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;
