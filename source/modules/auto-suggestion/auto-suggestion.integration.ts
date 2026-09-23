import fs from "fs/promises";
import os from "os";
import path from "path";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { AutoSuggestion } from "./auto-suggestion";

suite("Auto Suggestion", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new AutoSuggestion().install(context);
    });

    test("installs ble.sh", async () => {
        const filePath = path.join(os.homedir(), ".local", "share", "blesh", "ble.sh");
        const statistics = await fs.stat(filePath, { throwIfNoEntry: false });

        expect(statistics?.isFile()).toBe(true);
    });

    test("copies the configuration into the home directory", async () => {
        const sourceFilePath = path.join(assetsDirectoryPath, ".blerc");
        const destinationFilePath = path.join(os.homedir(), ".blerc");

        expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
    });

    test("skips the installation when ble.sh is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new AutoSuggestion().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
