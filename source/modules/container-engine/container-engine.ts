import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["docker-ce", "docker-ce-cli", "containerd.io", "docker-buildx-plugin", "docker-compose-plugin"];
const keyringFilePath = path.join("/", "usr", "share", "keyrings", "docker.gpg");
const sourceFilePath = path.join("/", "etc", "apt", "sources.list.d", "docker.list");

export class ContainerEngine implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(["docker-ce"]);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Container Engine");
        context.logger.add(task);
        task.start();

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

        task.continue("Set up docker sources");
        const exec = util.promisify(childProcess.exec);

        await exec(
            `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o ${keyringFilePath}`,
        );

        await exec(
            `echo "deb [arch=$(dpkg --print-architecture) signed-by=${keyringFilePath}] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee ${sourceFilePath} > /dev/null`,
        );

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.continue("Add user to docker group");
        await exec(`sudo usermod --append --groups docker ${os.userInfo().username}`);

        task.finish();
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove Container Engine");
        context.logger.add(task);
        task.start();

        task.continue("Remove docker");
        await context.dependencyManager.purge([...dependencies, "docker-ce-rootless-extras"], task);

        task.continue("Remove docker sources");
        const exec = util.promisify(childProcess.exec);
        await exec(`sudo rm -f ${keyringFilePath} ${sourceFilePath}`);

        task.continue("Remove images, containers, and volumes");
        await exec("sudo rm -rf /var/lib/docker /var/lib/containerd");

        task.continue("Remove docker group");
        await exec("if getent group docker > /dev/null; then sudo groupdel docker; fi");

        task.continue("Remove user data");
        await fs.rm(path.join(context.directories.home, ".docker"), { recursive: true, force: true });

        task.finish();
    }
}
