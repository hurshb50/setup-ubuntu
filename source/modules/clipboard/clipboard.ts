import type { InstallContext, Package } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["wl-clipboard", "xclip"];

export class Clipboard implements Package {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(dependencies);
    }

    async install(context: InstallContext): Promise<void> {
        const task = new Task("Clipboard");
        context.logger.add(task);
        task.start();

        const isInstalled = await this.isInstalled(context);

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
