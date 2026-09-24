import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { VersionControlSystem } from "./version-control-system";

suite("Version Control System", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new VersionControlSystem().install(context);
    });

    test("makes git available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("git --version");
        expect(stdout).toMatch(/^git version \d+\.\d+\.\d+/);
    });

    test("makes the build toolchain available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("make --version");
        expect(stdout).toMatch(/^GNU Make \d+\.\d+/);
    });

    test("copies the git configuration into the home directory", async () => {
        const sourceFilePath = path.join(assetsDirectoryPath, ".gitconfig");
        const destinationFilePath = path.join(os.homedir(), ".gitconfig");

        expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
    });

    test("skips the installation when the dependencies are already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new VersionControlSystem().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
