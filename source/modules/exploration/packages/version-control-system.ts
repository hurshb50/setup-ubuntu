import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../t../logger

export class VersionControlSystem implements Package {
    systemDependencyNames = ["build-essential"];
    systemName = "git";

    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Version Control System");
        logger.add(task);
        task.start();

        task.finish();
    }
}
