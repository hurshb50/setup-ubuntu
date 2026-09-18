import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class VersionControlSystem implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Version Control System");
        context.logger.add(task);
        task.start();

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const dependencies = ["git", "build-essential"];
        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
