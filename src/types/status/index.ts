export const RESOURCE_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
} as const;

export type ResourceStatus = (typeof RESOURCE_STATUS)[keyof typeof RESOURCE_STATUS];
