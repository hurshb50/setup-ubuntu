import os from "os";
import { execa } from "execa";
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
        const { exitCode, stdout } = await execa("docker", ["--version"], { reject: false });
        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/^Docker version \d+\.\d+\.\d+/);
    });

    test("adds the user to the docker group", async () => {
        const { exitCode, stdout } = await execa("id", ["-nG", os.userInfo().username], { reject: false });
        expect(exitCode).toBe(0);
        expect(stdout.split(" ")).toContain("docker");
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
