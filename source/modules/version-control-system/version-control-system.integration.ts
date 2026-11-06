import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { afterAll, beforeAll, expect, suite, test, vi } from "vite-plus/test";
import { DependencyManager } from "../dependency-manager/dependency-manager";
import { Logger } from "../logger/logger";
import { assetsDirectoryPath, projectDirectoryPath } from "../test/integration/paths";
import { VersionControlSystem } from "./version-control-system";

suite("Version Control System", () => {
    const context = {
        dependencyManager: new DependencyManager(),
        directories: { assets: assetsDirectoryPath, current: projectDirectoryPath, home: "" },
        logger: new Logger(),
    };
    let homeDirectoryPath: string;

    beforeAll(async () => {
        homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "version-control-system-"));
        context.directories.home = homeDirectoryPath;
        await fs.writeFile(
            path.join(homeDirectoryPath, ".gitconfig"),
            "[user]\n\tname = Existing User\n\temail = existing@example.com\n",
        );
        await new VersionControlSystem().install(context);
    });

    afterAll(async () => {
        await fs.rm(homeDirectoryPath, { recursive: true, force: true });
    });

    test("makes git available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("git --version");
        expect(stdout).toMatch(/^git version \d+\.\d+\.\d+/);
    });

    test("makes git lfs available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("git lfs version");
        expect(stdout).toMatch(/^git-lfs\/\d+\.\d+\.\d+/);
    });

    test("makes the build toolchain available", async () => {
        const exec = util.promisify(childProcess.exec);
        const { stdout } = await exec("make --version");
        expect(stdout).toMatch(/^GNU Make \d+\.\d+/);
    });

    test("applies git settings while preserving the existing user identity", async () => {
        const sourceFilePath = path.join(assetsDirectoryPath, ".gitconfig");
        const destinationFilePath = path.join(homeDirectoryPath, ".gitconfig");
        const sourceConfiguration = await fs.readFile(sourceFilePath, "utf8");
        const destinationConfiguration = await fs.readFile(destinationFilePath, "utf8");

        expect(destinationConfiguration).toContain(sourceConfiguration.trim());
        expect(destinationConfiguration).toContain("[user]\n\tname = Existing User\n\temail = existing@example.com");
        expect(destinationConfiguration).toContain('[credential "https://gist.github.com"]');
    });

    test.each([
        ["https://github.com/rai-inst/control_suite.git", "hpatel@theaiinstitute.com"],
        ["https://github.com/hurshb50/setup-ubuntu.git", "hurshb50@gmail.com"],
        ["https://github.com/other/project.git", "existing@example.com"],
    ])("resolves the identity for a repository with remote %s", async (remoteUrl, expectedEmail) => {
        const exec = util.promisify(childProcess.exec);
        const repositoryDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "version-control-system-repository-"));
        const options = {
            cwd: repositoryDirectoryPath,
            env: { ...process.env, HOME: homeDirectoryPath, GIT_CONFIG_NOSYSTEM: "1" },
        };

        try {
            await exec("git init --quiet", options);
            await exec(`git remote add origin ${remoteUrl}`, options);
            const { stdout } = await exec("git config user.email", options);
            expect(stdout.trim()).toBe(expectedEmail);
        } finally {
            await fs.rm(repositoryDirectoryPath, { recursive: true, force: true });
        }
    });

    test("does not define a user identity when none exists", async () => {
        const homeDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), "version-control-system-no-user-"));

        try {
            await new VersionControlSystem().install({
                ...context,
                directories: { ...context.directories, home: homeDirectoryPath },
            });

            const configuration = await fs.readFile(path.join(homeDirectoryPath, ".gitconfig"), "utf8");
            expect(configuration).not.toMatch(/^\s*\[user\]/im);
        } finally {
            await fs.rm(homeDirectoryPath, { recursive: true, force: true });
        }
    });

    test("skips the installation when the dependencies are already installed", async () => {
        const update = vi.spyOn(context.dependencyManager, "update");
        const install = vi.spyOn(context.dependencyManager, "install");

        try {
            await new VersionControlSystem().install(context);
            expect(update).not.toHaveBeenCalled();
            expect(install).not.toHaveBeenCalled();
        } finally {
            update.mockRestore();
            install.mockRestore();
        }
    });
});
