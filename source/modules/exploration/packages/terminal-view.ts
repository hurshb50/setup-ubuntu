import type { InstallContext, Package } from "../package";
import { Task } from "../task";
import { execAsync } from "../../exec-async";

export class TerminalView implements Package {
    async install(context: InstallContext): Promise<void> {
        const task = new Task("Install Terminal View");
        context.logger.add(task);
        task.start();

        task.continue("Update package manager");
        await context.dependencyManager.update();

        const dependencies = ["unzip"];
        task.continue(`Installing dependencies: ${dependencies.join(", ")}`);
        await context.dependencyManager.install(dependencies);

        task.continue("Install oh-my-posh");
        await execAsync("curl -s https://ohmyposh.dev/install.sh | bash -s");

        task.finish();
    }
}
