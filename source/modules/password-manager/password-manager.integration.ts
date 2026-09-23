import os from "os";
import { execa } from "execa";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { PasswordManager } from "./password-manager";

suite("Password Manager", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new PasswordManager().install(context);
    });

    test("installs the 1password package", async () => {
        const { exitCode, stdout } = await execa("dpkg-query", ["--show", "--showformat=${Status}", "1password"], {
            reject: false,
        });
        expect(exitCode).toBe(0);
        expect(stdout).toContain("install ok installed");
    });

    test("skips the installation when the 1password package is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new PasswordManager().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
