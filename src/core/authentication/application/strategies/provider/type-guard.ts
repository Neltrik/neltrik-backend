interface EmailPasswordCredentials {
    password: string;
}

export function isEmailPasswordCredentials(credentials: unknown): credentials is EmailPasswordCredentials {
    return (
        typeof credentials === "object" &&
        credentials !== null &&
        "password" in credentials &&
        typeof (credentials as Record<string, unknown>).password === "string" &&
        (credentials as Record<string, unknown>).password !== ""
    );
}
