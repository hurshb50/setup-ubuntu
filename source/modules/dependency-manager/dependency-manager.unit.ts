import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { Task } from "../task/task";
import { DependencyManager } from "./dependency-manager";

type ExecCallback = (error: Error | null, result?: { stderr: string; stdout: string }) => void;

const childProcessMocks = vi.hoisted(() => ({ exec: vi.fn(), execSync: vi.fn(), spawn: vi.fn() }));
const fileSystemMocks = vi.hoisted(() => ({ stat: vi.fn() }));

vi.mock("child_process", () => ({
    default: {
        exec: childProcessMocks.exec,
        execSync: childProcessMocks.execSync,
        spawn: childProcessMocks.spawn,
    },
}));

vi.mock("fs/promises", () => ({
    default: { stat: fileSystemMocks.stat },
}));

const lastArgument = (arguments_: unknown[]): ExecCallback => arguments_.at(-1) as ExecCallback;

// The final response is repeated for every remaining `exec` call.
const respondToExec = (...responses: Array<Error | string>): void => {
    childProcessMocks.exec.mockImplementation((...arguments_: unknown[]) => {
        const callback = lastArgument(arguments_);
        const response = responses.length > 1 ? responses.shift() : responses.at(0);

        if (response instanceof Error) {
            callback(response);
            return;
        }

        callback(null, { stderr: "", stdout: response ?? "" });
    });
};

const respondToPackageQueries = (statuses: Record<string, Error | string>): void => {
    childProcessMocks.exec.mockImplementation((command: string, ...arguments_: unknown[]) => {
        const callback = lastArgument(arguments_);
        const dependency = command.split(" ").at(-1) ?? "";
        const status = statuses[dependency];

        if (status instanceof Error) {
            callback(status);
            return;
        }

        callback(null, { stderr: "", stdout: status ?? "" });
    });
};

describe("DependencyManager", () => {
    beforeEach(() => {
        childProcessMocks.exec.mockReset();
        childProcessMocks.execSync.mockReset();
        childProcessMocks.spawn.mockReset();
        fileSystemMocks.stat.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("commandExists", () => {
        test("finds a command on the path", async () => {
            childProcessMocks.execSync.mockReturnValue("/usr/bin/zed");

            await expect(new DependencyManager().commandExists("zed")).resolves.toBe(true);
            expect(childProcessMocks.execSync).toHaveBeenCalledWith("command -v zed");
        });

        test("finds a command in the local bin directory", async () => {
            childProcessMocks.execSync.mockImplementation(() => {
                throw new Error("Command failed");
            });
            fileSystemMocks.stat.mockResolvedValue({});

            await expect(new DependencyManager().commandExists("zed")).resolves.toBe(true);
            expect(fileSystemMocks.stat).toHaveBeenCalledWith(path.join(os.homedir(), ".local", "bin", "zed"), {
                throwIfNoEntry: false,
            });
        });

        test("reports a command that is missing everywhere", async () => {
            childProcessMocks.execSync.mockImplementation(() => {
                throw new Error("Command failed");
            });
            fileSystemMocks.stat.mockResolvedValue(undefined);

            await expect(new DependencyManager().commandExists("zed")).resolves.toBe(false);
        });
    });

    describe("isInstalled", () => {
        test("reports installed dependencies", async () => {
            respondToPackageQueries({
                "build-essential": "install ok installed",
                git: "install ok installed",
            });

            await expect(new DependencyManager().isInstalled(["git", "build-essential"])).resolves.toBe(true);
            expect(childProcessMocks.exec).toHaveBeenCalledWith(
                "dpkg-query --show --showformat='${Status}' git",
                expect.any(Function),
            );
        });

        test("reports a dependency that is not installed", async () => {
            respondToPackageQueries({
                "build-essential": "deinstall ok config-files",
                git: "install ok installed",
            });

            await expect(new DependencyManager().isInstalled(["git", "build-essential"])).resolves.toBe(false);
        });

        test("treats a failed query as a dependency that is not installed", async () => {
            respondToPackageQueries({
                git: new Error("dpkg-query: no packages found matching git"),
            });

            await expect(new DependencyManager().isInstalled(["git"])).resolves.toBe(false);
        });
    });

    describe("authenticate", () => {
        test("skips the password prompt when sudo credentials are cached", async () => {
            respondToExec("");
            const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await new DependencyManager().authenticate();

            expect(write).not.toHaveBeenCalled();
            expect(childProcessMocks.exec).toHaveBeenCalledTimes(1);
            expect(childProcessMocks.exec).toHaveBeenCalledWith(
                "sudo --non-interactive --validate",
                expect.any(Function),
            );
        });

        test("asks for a password on the terminal when sudo credentials are missing", async () => {
            const error = Object.assign(new Error("sudo: a password is required"), { code: 1 });
            respondToExec(error, "");
            const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await new DependencyManager().authenticate();

            expect(write).toHaveBeenCalled();
            expect(childProcessMocks.exec).toHaveBeenCalledTimes(2);
            expect(childProcessMocks.exec).toHaveBeenLastCalledWith("sudo --validate", expect.any(Function));
        });

        test("reports when administrator access is not granted", async () => {
            const error = Object.assign(new Error("sudo: a password is required"), { code: 1 });
            respondToExec(error);
            vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await expect(new DependencyManager().authenticate()).rejects.toThrow(
                "Administrator access was not granted. Run 'sudo --validate' and then run this tool again.",
            );
        });
    });

    describe("update", () => {
        test("refuses to run apt-get when administrator access is missing", async () => {
            const error = Object.assign(new Error("sudo: a password is required"), { code: 1 });
            respondToExec(error);

            const task = new Task("Smart Change Directory");
            task.start();

            await expect(new DependencyManager().update(task)).rejects.toThrow(
                "Administrator access is no longer available for apt-get. Run 'sudo --validate' and then run this tool again.",
            );

            expect(childProcessMocks.exec).toHaveBeenCalledTimes(1);
            expect(childProcessMocks.spawn).not.toHaveBeenCalled();
        });
    });
});
