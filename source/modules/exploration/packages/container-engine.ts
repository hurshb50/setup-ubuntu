import os from "os";
import path from "path";
import type { InstallContext, Package } from "../package";
import { Task } from "../task";
import { execAsync } from "../../exec-async";

export class ContainerEngine implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Container Engine");
        context.logger.add(task);
        task.start();

        task.continue("Update package manager");
        await context.dependencyManager.update();

        const systemDependencies = ["gnupg"];
        task.continue(`Installing dependencies: ${systemDependencies.join(", ")}`);
        await context.dependencyManager.install(systemDependencies);

        const keyringFilePath = path.join("/", "usr", "share", "keyrings", "docker.gpg");
        const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "docker.list");

        task.continue("Set up docker sources");

        await execAsync(
            `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
        );

        await execAsync(
            `echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyringFilePath}] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee ${sourceFilePath} > /dev/null`,
        );

        task.continue("Update package manager");
        await context.dependencyManager.update();

        const dependencies = [
            "docker-ce",
            "docker-ce-cli",
            "containerd.io",
            "docker-buildx-plugin",
            "docker-compose-plugin",
        ];

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies);

        task.continue("Add user to docker group");
        await execAsync(`sudo usermod --append --groups docker ${os.userInfo().username}`);

        task.finish();
    }
}
