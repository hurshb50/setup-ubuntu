import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../t../logger

export class FuzzyFinder implements Package {
    systemName = "fzf";

    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Fuzzy Finder");
        logger.add(task);
        task.start();

        task.finish();
    }
}
