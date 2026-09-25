export const COOKIE_NAMES = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    CSRF_TOKEN: "csrfToken",
} as const;

export const MAX_AGE = {
    ACCESS_TOKEN: 15 * 60 * 1000,
    REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,
} as const;

export const CSRF_HEADER_NAME = "x-csrf-token";
