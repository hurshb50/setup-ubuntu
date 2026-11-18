import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { pathExists } from "../test/integration/file-system";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { alsaPackageName, PasswordManager } from "./password-manager";

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
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("dpkg-query --show --showformat='${Status}' 1password");
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

    test("reports 1password as installed", async () => {
        expect(await new PasswordManager().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".config", "1Password");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new PasswordManager().uninstall(context);
        });

        test("removes 1password", async () => {
            expect(await new PasswordManager().isInstalled(context)).toBe(false);
        });

        test("keeps the shared alsa library", async () => {
            const osRelease = await fs.readFile("/etc/os-release", "utf8");
            expect(await context.dependencyManager.isInstalled([alsaPackageName(osRelease)])).toBe(true);
        });

        test("removes the 1password sources and signing policy", async () => {
            const filePaths = [
                "/usr/share/keyrings/1password-archive-keyring.gpg",
                "/etc/apt/sources.list.d/1password.list",
                "/etc/debsig/policies/AC2D62742012EA22",
                "/usr/share/debsig/keyrings/AC2D62742012EA22",
            ];

            for (const filePath of filePaths) expect(await pathExists(filePath)).toBe(false);
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
