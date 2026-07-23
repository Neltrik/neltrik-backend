import sanitizeHtml from "sanitize-html";

import { SanitizationService } from "./index";

jest.mock("sanitize-html", () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe("SanitizationService", () => {
    const sanitizeHtmlMock = jest.mocked(sanitizeHtml);

    const makeSut = () => {
        return new SanitizationService();
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return null", () => {
        const sut = makeSut();
        expect(sut.sanitize(null)).toBeNull();
    });

    it("should return undefined", () => {
        const sut = makeSut();
        expect(sut.sanitize(undefined)).toBeUndefined();
    });

    it("should return dates without modification", () => {
        const sut = makeSut();
        const date = new Date();
        expect(sut.sanitize(date)).toBe(date);
    });

    it("should sanitize strings", () => {
        const sut = makeSut();
        sanitizeHtmlMock.mockReturnValue("<b>Hello</b>");
        const result = sut.sanitize("<b>Hello</b>");
        expect(sanitizeHtmlMock).toHaveBeenCalledTimes(1);
        expect(sanitizeHtmlMock).toHaveBeenCalledWith("<b>Hello</b>", {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: "discard",
        });
        expect(result).toBe("<b>Hello</b>");
    });

    it("should normalize whitespace after sanitization", () => {
        const sut = makeSut();
        sanitizeHtmlMock.mockReturnValue("   hello      world   ");
        const result = sut.sanitize("ignored");
        expect(result).toBe("hello world");
    });

    it("should sanitize arrays recursively", () => {
        const sut = makeSut();
        sanitizeHtmlMock.mockReturnValueOnce("Hello").mockReturnValueOnce("World");
        const result = sut.sanitize(["<b>Hello</b>", "<script>World</script>"]);
        expect(result).toEqual(["Hello", "World"]);
        expect(sanitizeHtmlMock).toHaveBeenCalledTimes(2);
    });

    it("should sanitize objects recursively", () => {
        const sut = makeSut();
        sanitizeHtmlMock.mockReturnValueOnce("John").mockReturnValueOnce("Developer");
        const result = sut.sanitize({
            name: "<b>John</b>",
            profile: {
                description: "<script>Developer</script>",
            },
        });
        expect(result).toEqual({
            name: "John",
            profile: {
                description: "Developer",
            },
        });
        expect(sanitizeHtmlMock).toHaveBeenCalledTimes(2);
    });

    it("should return numbers without modification", () => {
        const sut = makeSut();
        expect(sut.sanitize(123)).toBe(123);
    });

    it("should return booleans without modification", () => {
        const sut = makeSut();
        expect(sut.sanitize(true)).toBe(true);
    });
});
