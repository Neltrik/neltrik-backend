export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "subject-case": [2, "always", "lower-case"],
        "type-enum": [
            2,
            "always",
            ["feat", "fix", "refactor", "test", "docs", "style", "perf", "chore", "build", "ci", "revert"],
        ],
    },
};
