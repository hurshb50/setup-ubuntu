import { describe, expect, test } from "vite-plus/test";
import { renderBanner } from "./logger";

describe("renderBanner", () => {
    test("renders a complete bordered banner", () => {
        const lines = renderBanner("Ubuntu Setup", 42);
        const top = lines[0] ?? "";
        const middle = lines[1] ?? "";
        const bottom = lines[2] ?? "";
        const titleIndex = middle.indexOf("Ubuntu Setup");

        expect(lines).toHaveLength(3);
        expect(top).toContain(`╭${"─".repeat(40)}╮`);
        expect(titleIndex).toBeGreaterThan(0);
        expect(middle.slice(0, titleIndex)).toContain("│");
        expect(middle.slice(titleIndex)).toContain("│");
        expect(bottom).toContain(`╰${"─".repeat(40)}╯`);
    });
});
