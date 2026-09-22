import type { InstallContext, Package } from "../../package/package";
import { Task } from "../../task/task";

export class VersionControlSystem implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Version Control System");
        context.logger.add(task);
        task.start();

        const dependencies = ["git", "build-essential"];
        const isInstalled = await context.dependencyManager.isInstalled(dependencies);

        if (isInstalled) {
            task.finish();
            return;
        }

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.finish();
    }
}
