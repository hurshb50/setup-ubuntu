import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class PasswordManager implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Password Manager");
        context.logger.add(task);
        task.start();

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
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output ${keyringFilePath}`,
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
            `curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output ${debsigKeyringFilePath}`,
            { shell: true },
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const dependencies = ["1password"];
        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
