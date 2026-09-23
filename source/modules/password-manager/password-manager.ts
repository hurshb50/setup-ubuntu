import fs from "fs/promises";
import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class PasswordManager implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Password Manager");
        context.logger.add(task);
        task.start();

        const osRelease = await fs.readFile(path.join("/", "etc", "os-release"), "utf8");
        const versionId = osRelease.match(/^VERSION_ID="?([\d.]+)"?$/m)?.[1];
        const alsaPackageName = Number.parseInt(versionId ?? "", 10) >= 24 ? "libasound2t64" : "libasound2";
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

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "1password-archive-keyring.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "1password.list");
        const policyDirectoryPath = path.join("/", "etc", "debsig", "policies", "AC2D62742012EA22");
        const policyFilePath = path.join(policyDirectoryPath, "1password.pol");
        const debsigKeyringDirectoryPath = path.join("/", "usr", "share", "debsig", "keyrings", "AC2D62742012EA22");
        const debsigKeyringFilePath = path.join(debsigKeyringDirectoryPath, "debsig.gpg");

        task.continue("Set up 1password sources");

        await execa(
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --yes --output ${keyringFilePath}`,
            { shell: true },
        );

        await execa(
            `echo 'deb [arch=amd64 signed-by=${keyringFilePath}] https://downloads.1password.com/linux/debian/amd64 stable main' | sudo tee ${sourceFilePath}`,
            { shell: true },
        );

        await execa(`sudo mkdir -p ${policyDirectoryPath}`, { shell: true });

        await execa(
            `curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | sudo tee ${policyFilePath}`,
            {
                shell: true,
            },
        );

        await execa(`sudo mkdir -p ${debsigKeyringDirectoryPath}`, { shell: true });

        await execa(
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --yes --output ${debsigKeyringFilePath}`,
            { shell: true },
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
