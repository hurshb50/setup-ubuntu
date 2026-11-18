import { describe, expect, test } from "vite-plus/test";
import { zoxideDownloadUrl } from "./smart-change-directory";

describe("zoxideDownloadUrl", () => {
    const releaseUrl = "https://github.com/ajeetdsouza/zoxide/releases/tag/v0.10.0";

    test("builds the download url for x86_64", () => {
        expect(zoxideDownloadUrl(releaseUrl, "x64")).toBe(
            "https://github.com/ajeetdsouza/zoxide/releases/download/v0.10.0/zoxide-0.10.0-x86_64-unknown-linux-musl.tar.gz",
        );
    });

    test("builds the download url for arm64", () => {
        expect(zoxideDownloadUrl(`${releaseUrl}\n`, "arm64")).toBe(
            "https://github.com/ajeetdsouza/zoxide/releases/download/v0.10.0/zoxide-0.10.0-aarch64-unknown-linux-musl.tar.gz",
        );
    });

    test("rejects a url without a release tag", () => {
        expect(() => zoxideDownloadUrl("https://github.com/ajeetdsouza/zoxide/releases", "x64")).toThrow(
            "Cannot find the zoxide version",
        );
    });

    test("rejects an unsupported architecture", () => {
        expect(() => zoxideDownloadUrl(releaseUrl, "ia32")).toThrow("not available for architecture 'ia32'");
    });
});
