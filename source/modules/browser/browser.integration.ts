import os from "os";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
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
});
