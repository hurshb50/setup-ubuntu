import { execa } from "execa";

export class DependencyManager {
    private queue: Promise<void>;

    constructor() {
        this.queue = Promise.resolve();
    }

    async install(dependencies: string[]): Promise<void> {
        const operation = this.enqueue(["install", "-y", "--no-install-recommends", ...dependencies]);
        await operation;
    }

    async update(): Promise<void> {
        const operation = this.enqueue(["update"]);
        await operation;
    }

    private enqueue(managerArguments: string[]): Promise<void> {
        const operation = this.queue.then(async () => {
            await execa("sudo", ["apt-get", ...managerArguments]);
        });

        this.queue = operation.catch(() => {});
        return operation;
    }
}
