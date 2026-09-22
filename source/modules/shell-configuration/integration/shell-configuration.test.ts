import fs from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, test } from "vite-plus/test";
import { DependencyManager } from "../../dependency-manager/dependency-manager";
import { Logger } from "../../logger/logger";
import { ShellConfiguration } from "../shell-configuration";

const projectDirectoryPath = path.join(import.meta.dirname, "..", "..", "..", "..");
const assetsDirectoryPath = path.join(projectDirectoryPath, "assets");

describe("Shell Configuration", () => {
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
