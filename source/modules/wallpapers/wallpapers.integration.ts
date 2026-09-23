import fs from "fs/promises";
import os from "os";
import path from "path";
import { expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { Wallpapers } from "./wallpapers";

suite("Wallpapers", () => {
    test("copies the wallpapers into the backgrounds directory", async () => {
        const homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "wallpapers-"));

        try {
            await new Wallpapers().install({
                dependencyManager: new DependencyManager(),
                directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: homeDirectoryPath },
                logger: new Logger(),
            });

            const sourceDirectoryPath = path.join(assetsDirectoryPath, "wallpapers");
            const destinationDirectoryPath = path.join(homeDirectoryPath, ".local", "share", "backgrounds");
            const sourceFileNames = (await fs.readdir(sourceDirectoryPath)).sort();
            const destinationFileNames = (await fs.readdir(destinationDirectoryPath)).sort();

            expect(destinationFileNames).toEqual(sourceFileNames);

            for (const fileName of sourceFileNames) {
                expect(await fs.readFile(path.join(destinationDirectoryPath, fileName), "utf8")).toBe(
                    await fs.readFile(path.join(sourceDirectoryPath, fileName), "utf8"),
                );
            }
        } finally {
            await fs.rm(homeDirectoryPath, { force: true, recursive: true });
        }
    });
});
