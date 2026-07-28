export class SlugGenerator {
    public generate(value: string, id: string): string {
        const normalizedName = value
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        return `${normalizedName}-${id.slice(0, 8)}`;
    }
}
