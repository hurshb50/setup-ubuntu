import os from "os";
import { execa } from "execa";
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
        const { exitCode, stdout } = await execa("git", ["--version"], { reject: false });
        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/^git version \d+\.\d+\.\d+/);
    });

    test("makes the build toolchain available", async () => {
        const { exitCode, stdout } = await execa("make", ["--version"], { reject: false });
        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/^GNU Make \d+\.\d+/);
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
