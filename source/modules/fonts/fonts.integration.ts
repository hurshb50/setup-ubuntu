import fs from "fs/promises";
import os from "os";
import path from "path";
import { execa } from "execa";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { Fonts } from "./fonts";

suite("Fonts", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new Fonts().install(context);
    });

    test("copies the fonts into the fonts directory", async () => {
        const sourceDirectoryPath = path.join(assetsDirectoryPath, "fonts");
        const destinationDirectoryPath = path.join(os.homedir(), ".local", "share", "fonts");

        for (const directoryName of await fs.readdir(sourceDirectoryPath)) {
            const sourceDirectory = path.join(sourceDirectoryPath, directoryName);
            const destinationDirectory = path.join(destinationDirectoryPath, directoryName);
            const sourceFileNames = (await fs.readdir(sourceDirectory)).sort();
            const destinationFileNames = (await fs.readdir(destinationDirectory)).sort();

            expect(destinationFileNames).toEqual(sourceFileNames);

            for (const fileName of sourceFileNames) {
                expect(await fs.readFile(path.join(destinationDirectory, fileName))).toEqual(
                    await fs.readFile(path.join(sourceDirectory, fileName)),
                );
            }
        }
    });

    test("installs fontconfig", async () => {
        const { exitCode } = await execa("fc-list", [], { reject: false });
        expect(exitCode).toBe(0);
    });

    test("skips the installation when fontconfig is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new Fonts().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
