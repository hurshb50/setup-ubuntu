import fs from "fs/promises";
import os from "os";
import path from "path";
import { beforeAll, expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
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
});
