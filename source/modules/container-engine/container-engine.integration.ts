import os from "os";
import util from "util";
import childProcess from "child_process";
import { beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { ContainerEngine } from "./container-engine";

suite("Container Engine", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new ContainerEngine().install(context);
    });

    test("makes docker available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("docker --version");
        expect(stdout).toMatch(/^Docker version \d+\.\d+\.\d+/);
    });

    test("adds the user to the docker group", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec(`id -nG ${os.userInfo().username}`);
        expect(stdout.trim().split(" ")).toContain("docker");
    });

    test("skips the installation when docker is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new ContainerEngine().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
