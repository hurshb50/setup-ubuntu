import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class Browser implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Browser");
        context.logger.add(task);
        task.start();

        const dependencies = ["google-chrome-stable"];
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

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "google-chrome.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "google-chrome.list");

        task.continue("Set up google chrome sources");
        await execa(
            `curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
            {
                shell: true,
            },
        );

        await execa(
            `echo 'deb [arch=amd64 signed-by=${keyringFilePath}] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee ${sourceFilePath} > /dev/null`,
            { shell: true },
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
