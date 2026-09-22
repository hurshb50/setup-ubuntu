import os from "os";
import path from "path";
import { execa } from "execa";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

export class ContainerEngine implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Container Engine");
        context.logger.add(task);
        task.start();

        const dependencies = [
            "docker-ce",
            "docker-ce-cli",
            "containerd.io",
            "docker-buildx-plugin",
            "docker-compose-plugin",
        ];

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

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "docker.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "docker.list");

        task.continue("Set up docker sources");

        await execa(
            `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
            { shell: true },
        );

        await execa(
            `echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyringFilePath}] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee ${sourceFilePath} > /dev/null`,
            { shell: true },
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.continue("Add user to docker group");
        await execa(`sudo usermod --append --groups docker ${os.userInfo().username}`, { shell: true });

        task.finish();
    }
}
