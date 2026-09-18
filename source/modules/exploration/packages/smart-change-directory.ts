import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../t../logger
import { execAsync } from "../../exec-async";

export class SmartChangeDirectory implements Package {
    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Smart Change Directory");
        logger.add(task);
        task.start();

        task.continue("Install zoxide");
        await execAsync("curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh");
        task.finish();
    }
}
