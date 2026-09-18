import os from "os";
import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class ContainerEngine implements Package {
    systemDependencyNames = ["gnupg"];
    systemName = "docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin";

    async setupSystemSources(): Promise<void> {
        await execAsync(
            "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/docker.gpg",
        );

        await execAsync(
            'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
        );
    }

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Container Engine");
        logger.add(task);
        task.start();

        try {
            task.continue("Add user to docker group");
            await execAsync(`sudo usermod --append --groups docker ${os.userInfo().username}`);
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
