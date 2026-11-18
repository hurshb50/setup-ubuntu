import fs from "fs/promises";
import os from "os";
import path from "path";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { pathExists } from "../test/integration/file-system";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { CodeEditor } from "./code-editor";

suite("Code Editor", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new CodeEditor().install(context);
    });

    test("makes zed available", async () => {
        expect(await context.dependencyManager.commandExists("zed")).toBe(true);
    });

    test("copies the configuration into the configuration directory", async () => {
        const sourceDirectoryPath = path.join(assetsDirectoryPath, "zed");
        const destinationDirectoryPath = path.join(os.homedir(), ".config", "zed");

        for (const fileName of await fs.readdir(sourceDirectoryPath)) {
            const sourceFilePath = path.join(sourceDirectoryPath, fileName);
            const destinationFilePath = path.join(destinationDirectoryPath, fileName);

            expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
        }
    });

    test("reports zed as installed", async () => {
        expect(await new CodeEditor().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".local", "share", "zed");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new CodeEditor().uninstall(context);
        });

        test("removes zed", async () => {
            expect(await new CodeEditor().isInstalled(context)).toBe(false);
        });

        test("removes the application files", async () => {
            const filePaths = [
                path.join(os.homedir(), ".local", "zed.app"),
                path.join(os.homedir(), ".local", "share", "applications", "dev.zed.Zed.desktop"),
            ];

            for (const filePath of filePaths) expect(await pathExists(filePath)).toBe(false);
        });

        test("removes the configuration and user data", async () => {
            expect(await pathExists(path.join(os.homedir(), ".config", "zed"))).toBe(false);
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
