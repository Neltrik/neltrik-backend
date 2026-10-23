export const LOCALES = {
    ES_CO: "es-CO",
} as const;
export type Locale = (typeof LOCALES)[keyof typeof LOCALES];
