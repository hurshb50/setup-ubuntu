import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterAll, beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import type { InstallContext } from "../package/package";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { Wallpapers } from "./wallpapers";

suite("Wallpapers", () => {
    let homeDirectoryPath: string;
    let context: InstallContext;

    const sourceDirectoryPath = path.join(assetsDirectoryPath, "wallpapers");
    const destinationDirectoryPath = (): string => path.join(homeDirectoryPath, ".local", "share", "backgrounds");

    beforeAll(async () => {
        homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "wallpapers-"));
        context = {
            dependencyManager: new DependencyManager(),
            directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: homeDirectoryPath },
            logger: new Logger(),
        };

        await new Wallpapers().install(context);
    });

    afterAll(async () => {
        await fs.rm(homeDirectoryPath, { force: true, recursive: true });
    });

    test("copies the wallpapers into the backgrounds directory", async () => {
        const sourceFileNames = (await fs.readdir(sourceDirectoryPath)).sort();
        const destinationFileNames = (await fs.readdir(destinationDirectoryPath())).sort();

        expect(destinationFileNames).toEqual(sourceFileNames);

        for (const fileName of sourceFileNames) {
            expect(await fs.readFile(path.join(destinationDirectoryPath(), fileName), "utf8")).toBe(
                await fs.readFile(path.join(sourceDirectoryPath, fileName), "utf8"),
            );
        }
    });

    test("reports hydrapaper as installed", async () => {
        expect(await new Wallpapers().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const personalFileName = "personal-wallpaper.png";

        beforeAll(async () => {
            await fs.writeFile(path.join(destinationDirectoryPath(), personalFileName), "");
            await new Wallpapers().uninstall(context);
        });

        test("removes hydrapaper", async () => {
            expect(await new Wallpapers().isInstalled(context)).toBe(false);
        });

        test("removes only the copied wallpapers", async () => {
            expect(await fs.readdir(destinationDirectoryPath())).toEqual([personalFileName]);
        });
    });
});
