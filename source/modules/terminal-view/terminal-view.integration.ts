import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { TerminalView } from "./terminal-view";

suite("Terminal View", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new TerminalView().install(context);
    });

    test("makes oh-my-posh available", async () => {
        const filePath = path.join(os.homedir(), ".local", "bin", "oh-my-posh");
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec(`${filePath} --version`);
        expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    test("copies the configuration into the home directory", async () => {
        const sourceFilePath = path.join(assetsDirectoryPath, "oh-my-posh.toml");
        const destinationFilePath = path.join(os.homedir(), ".config", "oh-my-posh", "oh-my-posh.toml");

        expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
    });

    test("skips the installation when oh-my-posh is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new TerminalView().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
