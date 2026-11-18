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
import { SmartChangeDirectory } from "./smart-change-directory";

suite("Smart Change Directory", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: os.homedir() },
        logger: new Logger(),
    };

    beforeAll(async () => {
        await new SmartChangeDirectory().install(context);
    });

    const binaryFilePath = path.join(os.homedir(), ".local", "bin", "zoxide");

    test("makes zoxide available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec(`${binaryFilePath} --version`);
        expect(stdout).toMatch(/^zoxide \d+\.\d+\.\d+/);
    });

    test("replaces cd without recursing", async () => {
        const exec = util.promisify(childProcess.exec);
        const script = `eval "$(${binaryFilePath} init bash --cmd cd)"; cd / && pwd`;
        const { stdout } = await exec(`bash -c '${script}'`);
        expect(stdout.trim()).toBe("/");
    });

    test("skips the installation when zoxide is already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");
        const exec = vi.spyOn(childProcess, "exec");

        try {
            await new SmartChangeDirectory().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
            expect(exec).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
            exec.mockRestore();
        }
    });

    test("reports zoxide as installed", async () => {
        expect(await new SmartChangeDirectory().isInstalled(context)).toBe(true);
    });

    test("installs the manual pages", async () => {
        expect(await pathExists(path.join(os.homedir(), ".local", "share", "man", "man1", "zoxide.1"))).toBe(true);
    });

    suite("uninstall", () => {
        const userDataPath = path.join(os.homedir(), ".local", "share", "zoxide");
        const manualDirectoryPath = path.join(os.homedir(), ".local", "share", "man", "man1");

        beforeAll(async () => {
            await fs.mkdir(userDataPath, { recursive: true });
            await new SmartChangeDirectory().uninstall(context);
        });

        test("removes zoxide", async () => {
            expect(await new SmartChangeDirectory().isInstalled(context)).toBe(false);
        });

        test("removes the manual pages", async () => {
            const fileNames = await fs.readdir(manualDirectoryPath).catch(() => []);
            expect(fileNames.filter((fileName) => fileName.startsWith("zoxide"))).toEqual([]);
        });

        test("removes the user data", async () => {
            expect(await pathExists(userDataPath)).toBe(false);
        });
    });
});
