import { validateHtml } from "./";

jest.mock("sanitize-html", () => {
    return jest.fn((html: string) => {
        return html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
            .replace(/<\/?custom-tag\b[^>]*>/gi, "")
            .replace(/\s(onclick|id|class)="[^"]*"/gi, "")
            .replace(/(<a\b[^>]*\bhref=")(?!https?:|mailto:)[^"]*("[^>]*>)/gi, "$1$2")
            .replace(/(<img\b[^>]*\bsrc=")(?!https?:)[^"]*("[^>]*>)/gi, "$1$2");
    });
});

describe("validateHtml", () => {
    it("returns an empty array when the HTML is valid", () => {
        expect(validateHtml("<p>Hello world</p>")).toEqual([]);
    });

    it("returns an empty array when the HTML is empty", () => {
        expect(validateHtml("")).toEqual([]);
    });

    it("allows all permitted tags", () => {
        const html = `
            <h1>Title</h1>
            <h2>Subtitle</h2>
            <p>Paragraph</p>
            <strong>Bold</strong>
            <em>Italic</em>
            <u>Underline</u>
            <s>Strikethrough</s>
            <ul><li>Item</li></ul>
            <ol><li>Item</li></ol>
            <div><span>Text</span></div>
            <table>
                <thead><tr><th>Header</th></tr></thead>
                <tbody><tr><td>Cell</td></tr></tbody>
            </table>
            <br>
            <hr>
        `;
        expect(validateHtml(html)).toEqual([]);
    });

    it("allows permitted attributes", () => {
        const html = `
            <a href="https://example.com" target="_blank" rel="noopener">Link</a>
            <img src="https://example.com/image.png" alt="Image" width="100" height="50">
            <html lang="en"><body><p>Text</p></body></html>
        `;
        expect(validateHtml(html)).toEqual([]);
    });

    it("returns an error for disallowed tags", () => {
        const html = "<p>Hello</p><script>alert('xss')</script>";
        expect(validateHtml(html)).toEqual(["Disallowed tags: script"]);
    });

    it("returns an error for multiple disallowed tags", () => {
        const html = "<iframe></iframe><custom-tag></custom-tag>";
        expect(validateHtml(html)).toEqual(["Disallowed tags: iframe, custom"]);
    });

    it("returns an error for disallowed attributes", () => {
        const html = '<p onclick="alert(1)">Hello</p>';
        expect(validateHtml(html)).toEqual(["Disallowed attributes: onclick"]);
    });

    it("returns an error for multiple disallowed attributes", () => {
        const html = '<div id="test" class="container">Hello</div>';
        expect(validateHtml(html)).toEqual(["Disallowed attributes: id, class"]);
    });

    it("returns an error for disallowed link schemes", () => {
        const html = '<a href="javascript:alert(1)">Click me</a>';
        expect(validateHtml(html)).toEqual(["Disallowed links: javascript:alert(1)"]);
    });

    it("allows http, https and mailto links", () => {
        const html = `
            <a href="http://example.com">HTTP</a>
            <a href="https://example.com">HTTPS</a>
            <a href="mailto:test@example.com">Email</a>
        `;
        expect(validateHtml(html)).toEqual([]);
    });

    it("returns an error for disallowed image sources", () => {
        const html = '<img src="javascript:alert(1)" alt="Image">';
        expect(validateHtml(html)).toEqual(["Disallowed sources: javascript:alert(1)"]);
    });

    it("allows http and https image sources", () => {
        const html = `
            <img src="http://example.com/image.png" alt="HTTP image">
            <img src="https://example.com/image.png" alt="HTTPS image">
        `;
        expect(validateHtml(html)).toEqual([]);
    });

    it("reports multiple types of validation errors", () => {
        const html = `
            <script>alert(1)</script>
            <p onclick="alert(1)">Text</p>
            <a href="javascript:alert(1)">Unsafe link</a>
            <img src="javascript:alert(1)">
        `;
        expect(validateHtml(html)).toEqual([
            "Disallowed tags: script",
            "Disallowed attributes: onclick",
            "Disallowed links: javascript:alert(1)",
            "Disallowed sources: javascript:alert(1)",
        ]);
    });

    it("does not report duplicate disallowed tags", () => {
        const html = "<script></script><script></script>";
        expect(validateHtml(html)).toEqual(["Disallowed tags: script"]);
    });

    it("does not report duplicate disallowed attributes", () => {
        const html = `
            <p onclick="alert(1)">First</p>
            <div onclick="alert(2)">Second</div>
        `;
        expect(validateHtml(html)).toEqual(["Disallowed attributes: onclick"]);
    });
});
