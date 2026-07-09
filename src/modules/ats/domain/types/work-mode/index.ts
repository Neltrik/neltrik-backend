export const WORK_MODE = {
    ONSITE: "ONSITE",
    REMOTE: "REMOTE",
    HYBRID: "HYBRID",
} as const;

export type WorkMode = (typeof WORK_MODE)[keyof typeof WORK_MODE];
