import { SlugGenerator } from "./index";

describe("SlugGenerator", () => {
    const slugGenerator = new SlugGenerator();

    it("should generate a slug using normalized name and first 8 characters of id", () => {
        const slug = slugGenerator.generate("Acme Corp", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corp-550e8400");
    });

    it("should remove accents from name", () => {
        const slug = slugGenerator.generate("Compañía Pública", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("compania-publica-550e8400");
    });

    it("should convert name to lowercase", () => {
        const slug = slugGenerator.generate("ACME CORPORATION", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corporation-550e8400");
    });

    it("should remove special characters", () => {
        const slug = slugGenerator.generate("Acme & Corp!", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corp-550e8400");
    });

    it("should replace multiple spaces with a single hyphen", () => {
        const slug = slugGenerator.generate("Acme     Corporation", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corporation-550e8400");
    });

    it("should remove duplicated hyphens", () => {
        const slug = slugGenerator.generate("Acme---Corporation", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corporation-550e8400");
    });

    it("should trim spaces before generating slug", () => {
        const slug = slugGenerator.generate("   Acme Corp   ", "550e8400-e29b-41d4-a716-446655440000");
        expect(slug).toBe("acme-corp-550e8400");
    });
});
