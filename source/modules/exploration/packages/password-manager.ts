import type { Package } from "../package";
import { Task } from "../task";
import type { TaskLogger } from "../task-logger";
import { execAsync } from "../../exec-async";

export class PasswordManager implements Package {
    systemDependencyNames = ["gnupg"];
    systemName = "1password";

    async setupSystemSources(): Promise<void> {
        await execAsync(
            "curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg",
        );

        await execAsync(
            "echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | sudo tee /etc/apt/sources.list.d/1password.list",
        );

        await execAsync("sudo mkdir -p /etc/debsig/policies/AC2D62742012EA22/");

        await execAsync(
            "curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | sudo tee /etc/debsig/policies/AC2D62742012EA22/1password.pol",
        );

        await execAsync("sudo mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22");

        await execAsync(
            "curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg",
        );
    }

    async postSystemInstall(logger: TaskLogger): Promise<void> {
        const task = new Task("Setup Password Manager");
        logger.add(task);
        task.start();

        try {
            task.finish();
        } catch (error) {
            task.fail(error);
        }
    }
}
