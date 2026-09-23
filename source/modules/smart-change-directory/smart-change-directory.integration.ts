import os from "os";
import { execa } from "execa";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { SmartChangeDirectory } from "./smart-change-directory";

suite("Smart Change Directory", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new SmartChangeDirectory().install(context);
    });

    test("makes zoxide available", async () => {
        const { exitCode, stdout } = await execa("zoxide", ["--version"], { reject: false });
        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/^zoxide \d+\.\d+\.\d+/);
    });

    test("skips the installation when zoxide is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new SmartChangeDirectory().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
