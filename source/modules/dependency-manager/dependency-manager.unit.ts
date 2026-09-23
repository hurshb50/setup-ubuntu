import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { Task } from "../task/task";
import { DependencyManager } from "./dependency-manager";

const execaMock = vi.hoisted(() => vi.fn());

vi.mock("execa", () => ({ execa: execaMock }));

describe("DependencyManager", () => {
    beforeEach(() => {
        execaMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("authenticate", () => {
        test("skips the password prompt when sudo credentials are cached", async () => {
            execaMock.mockResolvedValue(undefined);

            await new DependencyManager().authenticate();

            expect(execaMock).toHaveBeenCalledTimes(1);
            expect(execaMock).toHaveBeenCalledWith("sudo", ["--non-interactive", "--validate"], { stdin: "ignore" });
        });

        test("asks for a password on the terminal when sudo credentials are missing", async () => {
            execaMock.mockRejectedValueOnce(new Error("sudo: a password is required"));
            execaMock.mockResolvedValueOnce(undefined);

            const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await new DependencyManager().authenticate();

            expect(write).toHaveBeenCalled();
            expect(execaMock).toHaveBeenLastCalledWith("sudo", ["--validate"], {
                stdin: "inherit",
                stdout: "inherit",
                stderr: "inherit",
            });
        });

        test("reports when administrator access is not granted", async () => {
            execaMock.mockRejectedValue(new Error("sudo: a password is required"));
            vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await expect(new DependencyManager().authenticate()).rejects.toThrow(
                "Administrator access was not granted. Run 'sudo --validate' and then run this tool again.",
            );
        });
    });

    describe("update", () => {
        test("refuses to run apt-get when administrator access is missing", async () => {
            execaMock.mockRejectedValue(new Error("sudo: a password is required"));

            const task = new Task("Smart Change Directory");
            task.start();

            await expect(new DependencyManager().update(task)).rejects.toThrow(
                "Administrator access is no longer available for apt-get. Run 'sudo --validate' and then run this tool again.",
            );

            expect(execaMock).toHaveBeenCalledTimes(1);
        });
    });
});
