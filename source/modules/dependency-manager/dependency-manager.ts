import fs from "fs/promises";
import os from "os";
import path from "path";
import util from "util";
import childProcess from "child_process";
import type { Task } from "../task/task";

export class DependencyManager {
    private queue: Promise<void>;

    constructor() {
        this.queue = Promise.resolve();
    }

    async commandExists(command: string): Promise<boolean> {
        try {
            childProcess.execSync(`command -v ${command}`);
            return true;
        } catch {
            const commandFilePath = path.join(os.homedir(), ".local", "bin", command);
            const statistics = await fs.stat(commandFilePath, { throwIfNoEntry: false });
            return statistics !== undefined;
        }
    }

    async isInstalled(dependencies: string[]): Promise<boolean> {
        const exec = util.promisify(childProcess.exec);

        const queryCalls = dependencies.map(async (dependency) => {
            try {
                const { stdout } = await exec(`dpkg-query --show --showformat='\${Status}' ${dependency}`);
                return stdout.includes("install ok installed");
            } catch {
                return false;
            }
        });

        const queries = await Promise.all(queryCalls);
        return queries.every((query) => query === true);
    }

    async authenticate(): Promise<void> {
        if (await this.isAuthenticated()) return;

        process.stdout.write(
            "Administrator access is required to install packages. You may be prompted for your password.\n\n",
        );

        try {
            const exec = util.promisify(childProcess.exec);
            await exec("sudo --validate");
        } catch (error) {
            throw new Error(
                "Administrator access was not granted. Run 'sudo --validate' and then run this tool again.",
                { cause: error },
            );
        }
    }

    async install(dependencies: string[], task: Task): Promise<void> {
        const operation = this.enqueue(["install", "-y", "--no-install-recommends", ...dependencies], task);
        await operation;
    }

    async update(task: Task): Promise<void> {
        const operation = this.enqueue(["update"], task);
        await operation;
    }

    private async isAuthenticated(): Promise<boolean> {
        try {
            const exec = util.promisify(childProcess.exec);
            await exec("sudo --non-interactive --validate");
            return true;
        } catch {
            return false;
        }
    }

    private enqueue(managerArguments: string[], task: Task): Promise<void> {
        const operation = this.queue.then(async () => {
            if (!(await this.isAuthenticated())) {
                throw new Error(
                    "Administrator access is no longer available for apt-get. Run 'sudo --validate' and then run this tool again.",
                );
            }

            const sudoEnvironment = ["DEBIAN_FRONTEND=noninteractive", "NEEDRESTART_SUSPEND=1"];

            const subprocess = childProcess.spawn("sudo", ["env", ...sudoEnvironment, "apt-get", ...managerArguments], {
                stdio: ["ignore", "pipe", "pipe"],
            });

            let partial = "";

            const track = (chunk: Buffer): void => {
                partial += chunk.toString();
                const lines = partial.split(/\r\n|\r|\n/);
                partial = lines.pop() ?? "";
                const line = lines.at(-1)?.trim();

                if (line) task.continue(line);
            };

            subprocess.stdout.on("data", track);
            subprocess.stderr.on("data", track);

            await new Promise<void>((resolve, reject) => {
                subprocess.once("error", reject);
                subprocess.once("close", (code) =>
                    code === 0 ? resolve() : reject(new Error(`apt-get exited with code ${code}`)),
                );
            });
        });

        this.queue = operation.catch(() => {});
        return operation;
    }
}
