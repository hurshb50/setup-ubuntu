import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";

export class FuzzyFinder implements Package {
    systemName = "fzf";

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Fuzzy Finder");
        logger.add(task);
        task.start();

        try {
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
