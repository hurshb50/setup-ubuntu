import fs from "fs/promises";
import os from "os";
import path from "path";
import childProcess from "child_process";
import { expect, test } from "vite-plus/test";

const projectDirectoryPath = path.join(import.meta.dirname, "..");

test("installs every package on a fresh machine", { timeout: 600_000 }, async () => {
    const subprocess = childProcess.spawn("setup-ubuntu", { stdio: "inherit" });

    await new Promise<void>((resolve, reject) => {
        subprocess.once("error", reject);
        subprocess.once("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`setup-ubuntu exited with code ${code}.`));
        });
    });

    const destinationFilePath = path.join(os.homedir(), ".bashrc");
    const sourceFilePath = path.join(projectDirectoryPath, "assets", ".bashrc");
    expect(await fs.readFile(destinationFilePath, "utf8")).toBe(await fs.readFile(sourceFilePath, "utf8"));
});
