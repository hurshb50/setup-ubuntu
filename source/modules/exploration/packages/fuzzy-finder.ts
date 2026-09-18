import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class FuzzyFinder implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Fuzzy Finder");
        context.logger.add(task);
        task.start();

        task.continue("Update package manager");
        await context.dependencyManager.update();

        const dependencies = ["fzf"];
        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies);

        task.finish();
    }
}
