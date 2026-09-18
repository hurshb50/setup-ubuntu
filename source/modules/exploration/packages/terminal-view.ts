import type { Package } from "../package";
import { Task } from "../task";
import type { Logger } from "../t../logger
import { execAsync } from "../../exec-async";

export class TerminalView implements Package {
    systemDependencyNames = ["unzip"];

    async postSystemInstall(logger: Logger): Promise<void> {
        const task = new Task("Setup Terminal View");
        logger.add(task);
        task.start();

        task.continue("Install oh-my-posh");
        await execAsync("curl -s https://ohmyposh.dev/install.sh | bash -s");
        task.finish();
    }
}
