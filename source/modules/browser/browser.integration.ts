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
import { Browser } from "./browser";

suite("Browser", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new Browser().install(context);
    });

    test("makes brave browser available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("brave-browser --version");
        expect(stdout).toMatch(/^Brave Browser \d+\.\d+\.\d+/);
    });

    test("configures unattended updates for brave", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("apt-config dump Unattended-Upgrade::Allowed-Origins");
        expect(stdout).toContain('"Brave Software:stable"');
    });

    test("skips the installation when brave browser is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new Browser().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });

    test("reports brave browser as installed", async () => {
        expect(await new Browser().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".config", "BraveSoftware");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new Browser().uninstall(context);
        });

        test("removes brave browser", async () => {
            expect(await new Browser().isInstalled(context)).toBe(false);
        });

        test("removes the brave sources and update configuration", async () => {
            const filePaths = [
                "/usr/share/keyrings/brave-browser-archive-keyring.gpg",
                "/etc/apt/sources.list.d/brave-browser-release.sources",
                "/etc/apt/apt.conf.d/51unattended-upgrades-brave",
            ];

            for (const filePath of filePaths) expect(await pathExists(filePath)).toBe(false);
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
