import { execa } from "execa";
import type { InstallContext, Package } from "../package";
import { Task } from "../task";

export class TerminalView implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Terminal View");
        context.logger.add(task);
        task.start();

        task.continue("Update package manager");
        await context.dependencyManager.update(task);

        const dependencies = ["unzip"];
        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies, task);

        task.continue("Install oh-my-posh");
        await execa("curl -s https://ohmyposh.dev/install.sh | bash -s", { shell: true });

        task.finish();
    }
}
