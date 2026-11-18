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
import { CodeHost } from "./code-host";

suite("Code Host", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new CodeHost().install(context);
    });

    test("makes the github cli available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("gh --version");
        expect(stdout).toMatch(/^gh version \d+\.\d+\.\d+/);
    });

    test("skips the installation when the github cli is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new CodeHost().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });

    test("reports the github cli as installed", async () => {
        expect(await new CodeHost().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".config", "gh");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new CodeHost().uninstall(context);
        });

        test("removes the github cli", async () => {
            expect(await new CodeHost().isInstalled(context)).toBe(false);
        });

        test("removes the github cli sources", async () => {
            expect(await pathExists("/usr/share/keyrings/github-cli.gpg")).toBe(false);
            expect(await pathExists("/etc/apt/sources.list.d/github-cli.list")).toBe(false);
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
