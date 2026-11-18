import fs from "fs/promises";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const keyringFilePath = path.join("/", "usr", "share", "keyrings", "1password-archive-keyring.gpg");
const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "1password.list");
const policyDirectoryPath = path.join("/", "etc", "debsig", "policies", "AC2D62742012EA22");
const debsigKeyringDirectoryPath = path.join("/", "usr", "share", "debsig", "keyrings", "AC2D62742012EA22");

export class PasswordManager implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(["1password"]);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Password Manager");
        context.logger.add(task);
        task.start();

        const osRelease = await fs.readFile(path.join("/", "etc", "os-release"), "utf8");
        const dependencies = [alsaPackageName(osRelease), "1password"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const systemDependencies = ["gnupg"];
        task.continue(`Installing dependencies: ${systemDependencies.join(", ")}`);
        await context.dependencyManager.install(systemDependencies, task);

        const policyFilePath = path.join(policyDirectoryPath, "1password.pol");
        const debsigKeyringFilePath = path.join(debsigKeyringDirectoryPath, "debsig.gpg");

        task.continue("Set up 1password sources");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --yes --output ${keyringFilePath}`,
        );

        await exec(
            `echo 'deb [arch=amd64 signed-by=${keyringFilePath}] https://downloads.1password.com/linux/debian/amd64 stable main' | sudo tee ${sourceFilePath}`,
        );

        await exec(`sudo mkdir -p ${policyDirectoryPath}`);

        await exec(
            `curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | sudo tee ${policyFilePath}`,
        );

        await exec(`sudo mkdir -p ${debsigKeyringDirectoryPath}`);

        await exec(
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --yes --output ${debsigKeyringFilePath}`,
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Password Manager");
        context.logger.add(task);
        task.start();

        // The ALSA library is shared with other applications, so only 1password is purged.
        task.continue("Remove 1password");
        await context.dependencyManager.purge(["1password"], task);

        task.continue("Remove 1password sources");
        const exec = util.promisify(childProcess.exec);
        await exec(
            `sudo rm -rf ${keyringFilePath} ${sourceFilePath} ${policyDirectoryPath} ${debsigKeyringDirectoryPath}`,
        );

        task.continue("Remove user data");
        const userDataPaths = [
            path.join(context.directories.home, ".config", "1Password"),
            path.join(context.directories.home, ".cache", "1Password"),
        ];

        await Promise.all(userDataPaths.map((userDataPath) => fs.rm(userDataPath, { recursive: true, force: true })));

        task.finish();
    }
}

export function alsaPackageName(osRelease: string): string {
    const versionId = osRelease.match(/^VERSION_ID="?([\d.]+)"?$/m)?.[1];

    return Number.parseInt(versionId ?? "", 10) >= 24 ? "libasound2t64" : "libasound2";
}
