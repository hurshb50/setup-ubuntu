import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class SmartChangeDirectory implements Package {
    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Smart Change Directory");
        logger.add(task);
        task.start();

        task.continue("Install zoxide");
        await execAsync("curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh");
        task.finish();
    }
}
