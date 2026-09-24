import os from "os";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { FuzzyFinder } from "./fuzzy-finder";

suite("Fuzzy Finder", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new FuzzyFinder().install(context);
    });

    test("makes fzf available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("fzf --version");
        expect(stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    test("skips the installation when fzf is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new FuzzyFinder().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
