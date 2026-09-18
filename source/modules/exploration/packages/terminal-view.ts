import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class TerminalView implements Package {
    systemDependencyNames = ["unzip"];

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Terminal View");
        logger.add(task);
        task.start();

        try {
            task.continue("Install oh-my-posh");
            await execAsync("curl -s https://ohmyposh.dev/install.sh | bash -s");
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
