import type { InstallContext, LegacyPackage } from "../package/package";
import { Task } from "../task/task";

const dependencies = ["zoxide"];

// Earlier releases installed zoxide with apt. Ubuntu 22.04 ships a version that crashes bash,
// so Smart Change Directory now installs it into ~/.local/bin instead.
export class AptZoxide implements LegacyPackage {
    async isInstalled(context: InstallContext): Promise<boolean> {
        return context.dependencyManager.isInstalled(dependencies);
    }

    async uninstall(context: InstallContext): Promise<void> {
        const task = new Task("Remove zoxide (apt)");
        context.logger.add(task);
        task.start();

        task.continue("Remove zoxide");
        await context.dependencyManager.purge(dependencies, task);

        task.finish();
    }
}
