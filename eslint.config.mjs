// @ts-check

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.js", "*.config.mjs"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    prettierConfig,
    {
        files: ["**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                project: ["./tsconfig.json", "./tsconfig.cli.json"],
                // @ts-ignore
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            prettier: prettierPlugin,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            /*
             * TypeScript
             */
            "@typescript-eslint/no-explicit-any": "error",

            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "no-restricted-syntax": [
                "error",
                {
                    selector: "TSEnumDeclaration",
                    message: "No se permiten 'enum'. Utiliza objetos 'as const' + 'type'.",
                },
                {
                    selector: "TSModuleDeclaration",
                    message: "No se permiten 'namespace'. Utiliza ES Modules (import/export).",
                },
            ],

            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/no-unsafe-argument": "error",
            "@typescript-eslint/no-unnecessary-condition": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",

            /*
             * JavaScript
             */
            "default-case-last": "error",
            "dot-notation": "error",
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],

            "no-console": [
                "error",
                {
                    allow: ["warn", "error"],
                },
            ],

            "no-debugger": "error",
            "object-shorthand": "error",

            /*
             * Calidad
             */

            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            complexity: ["error", 10],
            "max-lines": [
                "error",
                {
                    max: 300,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-lines-per-function": [
                "error",
                {
                    max: 60,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "no-multiple-empty-lines": [
                "error",
                {
                    max: 1,
                    maxEOF: 1,
                },
            ],
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // Node.js
                        ["^node:"],

                        // Librerías externas
                        ["^@nestjs", "^@?\\w"],

                        // Alias del proyecto
                        ["^@/"],

                        // Relativos
                        ["^\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",

            /*
             * Prettier
             */
            "prettier/prettier": "warn",
        },
    },
);
