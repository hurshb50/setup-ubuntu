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

    test("reports docker as installed", async () => {
        expect(await new ContainerEngine().isInstalled(context)).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".docker");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new ContainerEngine().uninstall(context);
        });

        test("removes every docker package", async () => {
            const dependencies = [
                "docker-ce",
                "docker-ce-cli",
                "containerd.io",
                "docker-buildx-plugin",
                "docker-compose-plugin",
            ];

            for (const dependency of dependencies) {
                expect(await context.dependencyManager.isInstalled([dependency])).toBe(false);
            }
        });

        test("removes the docker sources", async () => {
            expect(await pathExists("/usr/share/keyrings/docker.gpg")).toBe(false);
            expect(await pathExists("/etc/apt/sources.list.d/docker.list")).toBe(false);
        });

        test("removes the docker group", async () => {
            const exec = util.promisify(childProcess.exec);
            await expect(exec("getent group docker")).rejects.toThrow();
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
