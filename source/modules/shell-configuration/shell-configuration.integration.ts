import fs from "fs/promises";
import os from "os";
import path from "path";
import { expect, suite, test } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { ShellConfiguration } from "./shell-configuration";

suite("Shell Configuration", () => {
    const createContext = (homeDirectoryPath: string) => ({
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: homeDirectoryPath },
        logger: new Logger(),
    });

    test("copies the shell configuration into the home directory", async () => {
        const homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "shell-configuration-"));

        try {
            await new ShellConfiguration().install(createContext(homeDirectoryPath));

            const sourceFilePath = path.join(assetsDirectoryPath, ".bashrc");
            const destinationFilePath = path.join(homeDirectoryPath, ".bashrc");

            expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
        } finally {
            await fs.rm(homeDirectoryPath, { force: true, recursive: true });
        }
    });

    test("reports the shell configuration as installed only when it matches", async () => {
        const homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "shell-configuration-"));
        const context = createContext(homeDirectoryPath);

        try {
            await fs.writeFile(path.join(homeDirectoryPath, ".bashrc"), "# custom\n");
            expect(await new ShellConfiguration().isInstalled(context)).toBe(false);

            await new ShellConfiguration().install(context);
            expect(await new ShellConfiguration().isInstalled(context)).toBe(true);
        } finally {
            await fs.rm(homeDirectoryPath, { force: true, recursive: true });
        }
    });
});
