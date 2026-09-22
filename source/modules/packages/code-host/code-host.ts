import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../../package/package";
import { Task } from "../../task/task";

export class CodeHost implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Code Host");
        context.logger.add(task);
        task.start();

        const dependencies = ["gh"];
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

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "github-cli.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "github-cli.list");

        task.continue("Set up github cli sources");

        await execa(
            `curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.asc | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
            { shell: true },
        );

        await execa(
            `echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyringFilePath}] https://cli.github.com/packages stable main" | sudo tee ${sourceFilePath} > /dev/null`,
            { shell: true },
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
