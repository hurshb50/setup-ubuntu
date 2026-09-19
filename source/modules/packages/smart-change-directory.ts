import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class SmartChangeDirectory implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Smart Change Directory");
        context.logger.add(task);
        task.start();

        const dependencies = ["zoxide"];
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
