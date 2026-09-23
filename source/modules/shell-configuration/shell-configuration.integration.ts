import fs from "fs/promises";
import os from "os";
import path from "path";
import { expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { ShellConfiguration } from "./shell-configuration";

suite("Shell Configuration", () => {
    test("copies the shell configuration into the home directory", async () => {
        const homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "shell-configuration-"));

        try {
            await new ShellConfiguration().install({
                dependencyManager: new DependencyManager(),
                directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: homeDirectoryPath },
                logger: new Logger(),
            });

            const sourceFilePath = path.join(assetsDirectoryPath, ".bashrc");
            const destinationFilePath = path.join(homeDirectoryPath, ".bashrc");

            expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
        } finally {
            await fs.rm(homeDirectoryPath, { force: true, recursive: true });
        }
    });
});
