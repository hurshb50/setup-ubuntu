import { execa } from "execa";
import type { Task } from "./exploration/task";

export class DependencyManager {
    private queue: Promise<void>;

    constructor() {
        this.queue = Promise.resolve();
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
            const subprocess = execa("sudo", ["apt-get", ...managerArguments]);
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
