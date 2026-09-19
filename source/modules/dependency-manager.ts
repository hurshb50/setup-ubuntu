import fs from "fs/promises";
import os from "os";
import path from "path";
import { execa } from "execa";
import type { Task } from "./task";

export class DependencyManager {
    private queue: Promise<void>;

    constructor() {
        this.queue = Promise.resolve();
    }

    async commandExists(command: string): Promise<boolean> {
        try {
            await execa("command", ["-v", command], { shell: true, stdin: "ignore" });
            return true;
        } catch {
            const commandFilePath = path.join(os.homedir(), ".local", "bin", command);
            const statistics = await fs.stat(commandFilePath, { throwIfNoEntry: false });
            return statistics !== undefined;
        }
    }

    async isInstalled(dependencies: string[]): Promise<boolean> {
        const installations = await Promise.all(
            dependencies.map(async (dependency) => {
                try {
                    const { stdout } = await execa("dpkg-query", ["--show", "--showformat=${Status}", dependency]);
                    return stdout.includes("install ok installed");
                } catch {
                    return false;
                }
            }),
        );

        return installations.every((installation) => installation === true);
    }

    async install(dependencies: string[], task: Task): Promise<void> {
        const operation = this.enqueue(["install", "-y", "--no-install-recommends", ...dependencies], task);
        await operation;
    }

    async update(task: Task): Promise<void> {
        const operation = this.enqueue(["update"], task);
        await operation;
    }

    private enqueue(managerArguments: string[], task: Task): Promise<void> {
        const operation = this.queue.then(async () => {
            const sudoEnvironment = ["DEBIAN_FRONTEND=noninteractive", "NEEDRESTART_SUSPEND=1"];

            const subprocess = execa("sudo", ["env", ...sudoEnvironment, "apt-get", ...managerArguments], {
                stdin: "ignore",
            });

            let partial = "";

            subprocess.stdout?.on("data", (chunk: Buffer) => {
                partial += chunk.toString();
                const lines = partial.split(/\r\n|\r|\n/);
                partial = lines.pop() ?? "";
                const line = lines.at(-1)?.trim();

                if (line) task.continue(line);
            });

            await subprocess;
        });

        this.queue = operation.catch(() => {});
        return operation;
    }
}
