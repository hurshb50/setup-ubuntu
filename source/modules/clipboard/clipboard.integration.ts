import os from "os";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { Clipboard } from "./clipboard";

suite("Clipboard", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new Clipboard().install(context);
    });

    test("makes wl-clipboard available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("wl-copy --version");
        expect(stdout).toMatch(/^wl-clipboard \d+\.\d+\.\d+/);
    });

    test("makes xclip available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stderr } = await exec("xclip -version");
        expect(stderr).toMatch(/^xclip version \d+\.\d+/);
    });

    test("skips the installation when the dependencies are already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new Clipboard().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
